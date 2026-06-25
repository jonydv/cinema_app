# Home Multi-Sección, Filtros Expandidos e Historial

**Fecha:** 2026-06-25  
**Estado:** Aprobado — listo para implementar

---

## Contexto

La app ya tiene: Home (populares + trending carousel + filtros básicos de género/sort), Search, Detail (trailer, cast, recomendaciones, watch providers, rating de estrellas), Favorites, Watchlist, página de Actor.

Este sprint agrega tres ejes:

1. **Home multi-sección** — estilo Netflix con carouseles por categoría
2. **Filtros expandidos** — sidebar en desktop, bottom sheet en mobile, con año/rating/duración/géneros dinámicos
3. **Historial de vistos** — nueva página `/history` y toggle "Visto" en cards

---

## 1. Arquitectura

### Archivos nuevos

```
src/app/store/
  now-playing.store.ts        ← withTmdbList<Movie>()
  top-rated.store.ts          ← withTmdbList<Movie>()
  upcoming.store.ts           ← withTmdbList<Movie>()
  watched.store.ts            ← patrón localStorage igual que FavoritesStore

src/app/features/history/
  history.page.ts
  history.page.html

src/app/shared/ui/range-slider/
  range-slider.component.ts   ← slider reutilizable para año y duración
  range-slider.component.html
```

### Archivos modificados

```
src/app/data/api/tmdb.service.ts                    ← +getNowPlaying, +getTopRated, +getUpcoming, +getGenres
src/app/store/movies.store.ts                       ← +year, +minRating, +maxRuntime en estado y discover params
src/app/features/home/home.facade.ts                ← inyecta los 3 stores nuevos
src/app/features/home/home.page.html                ← 4 carouseles + layout sidebar/grilla
src/app/features/home/home.page.ts                  ← importa CarouselComponent, inyecta HomeFacade ampliada
src/app/features/home/components/home-filters.component.ts   ← géneros dinámicos + sliders
src/app/shared/ui/movie-card/movie-card.component.ts         ← +toggle "Visto" (👁)
src/app/shared/ui/movie-card/movie-card.component.html       ← badge "✓ Visto" + ícono
src/app/features/details/details.page.html          ← +botón "Marcar como visto"
src/app/features/details/details.facade.ts          ← inyecta WatchedStore
src/app/features/layout/app-shell.component.ts      ← +5° ítem en navItems
src/app/app.routes.ts                               ← +ruta /history lazy-loaded
public/i18n/es.json / en.json                       ← +claves nav.history, filters.*, history.*
```

### Data flow — Home

```
HomePage → HomeFacade
  → NowPlayingStore  → tmdb.getNowPlaying()   → adaptMovie (existente)
  → TrendingStore    → tmdb.getTrending()      → adaptMovie (ya existe)
  → TopRatedStore    → tmdb.getTopRated()      → adaptMovie (existente)
  → UpcomingStore    → tmdb.getUpcoming()      → adaptMovie (existente)
  → MoviesStore      → tmdb.getDiscoverMovies() con params expandidos
```

Los cuatro endpoints de carousel devuelven `TmdbPagedResponseDto<TmdbMovieDto>` — el `adaptMovie` existente los cubre sin adapter nuevo.

---

## 2. Nuevo Home — Layout

### Estructura de la página (arriba → abajo)

1. Header con título
2. **Carousel "En cartelera"** — `NowPlayingStore`, `app-carousel`
3. **Carousel "Trending esta semana"** — `TrendingStore` (ya existe)
4. **Carousel "Mejor valoradas"** — `TopRatedStore`, `app-carousel`
5. **Carousel "Próximos estrenos"** — `UpcomingStore`, `app-carousel`
6. **Sección Populares** — título + sidebar (desktop) o botón filtros (mobile) + grilla + scroll infinito

### Mobile vs Desktop para la sección Populares

- **Mobile** (`< md`): botón "⚙ Filtros" sobre la grilla abre el `BottomSheetComponent` existente con los campos de filtro. El sidebar está oculto con `hidden md:flex`.
- **Desktop** (`md:`): sidebar permanente a la izquierda (~220px), grilla a la derecha, ambos dentro de un `flex gap-6`.

### Stores nuevos — patrón

Los tres stores (`NowPlayingStore`, `TopRatedStore`, `UpcomingStore`) siguen exactamente el patrón de `TrendingStore`:

```typescript
export const NowPlayingStore = signalStore(
  { providedIn: 'root' },
  withTmdbList<Movie>(),
  withMethods((store, tmdb = inject(TmdbService)) => ({
    load: rxMethod<void>(
      pipe(
        tap(() => patchState(store, setLoading(), setAllEntities([]))),
        switchMap(() =>
          tmdb.getNowPlaying().pipe(
            tap(({ movies }) => patchState(store, setAllEntities(movies), setLoaded())),
            catchError(() => {
              patchState(store, setError('load_failed'))
              return EMPTY
            }),
          ),
        ),
      ),
    ),
  })),
  withHooks({
    onInit(store) {
      store.load()
      inject(TranslocoService)
        .langChanges$.pipe(distinctUntilChanged())
        .subscribe(() => store.load())
    },
  }),
)
```

---

## 3. Filtros Expandidos

### Campos del sidebar / bottom sheet

| Campo         | Control                                             | Parámetro TMDB                            |
| ------------- | --------------------------------------------------- | ----------------------------------------- |
| Géneros       | Chips multi-select (desde `/genre/movie/list`)      | `with_genres`                             |
| Año           | Select de año único (1970 – año actual)             | `primary_release_year`                    |
| Rating mínimo | Slider (0–10, paso 0.5)                             | `vote_average.gte` + `vote_count.gte=100` |
| Duración      | Opciones: Cualquiera / <90min / 90–150min / >150min | `with_runtime.lte` / `with_runtime.gte`   |
| Ordenar por   | Select: Popularidad / Rating / Fecha de estreno     | `sort_by`                                 |

### Géneros dinámicos

`TmdbService.getGenres()` llama a `/genre/movie/list` y devuelve `{ id: number, name: string }[]`. Se carga una vez en `HomeFiltersComponent.ngOnInit` y se cachea en una signal local. No necesita store ni adapter — el mapeo es inline.

### MoviesStore — estado expandido

```typescript
// Estado añadido
activeYear: number | null // null = cualquier año
minRating: number // 0 = sin filtro
maxRuntime: number | null // null = sin límite (en minutos)
minRuntime: number | null // null = sin límite
```

El método `getDiscoverMovies` en `TmdbService` acepta estos parámetros adicionales y los pasa como query params solo cuando tienen valor (no null/0).

### RangeSliderComponent

Componente standalone con inputs `min`, `max`, `step`, `value` y output `valueChange`. Usa un `<input type="range">` nativo estilizado con Tailwind. Usado únicamente por el slider de rating mínimo. El año usa un `<select>` nativo (más preciso que un slider), y la duración usa botones de opción — ninguno requiere el componente slider.

---

## 4. Historial de Vistos

### WatchedStore

```typescript
// Tipo guardado por entrada
interface WatchedEntry {
  date: string        // ISO date
  title: string
  posterUrl: string
  rating: number
}

// Estado
watched: Record<number, WatchedEntry>   // movieId → entrada completa

// Computed
watchedList(): Array<WatchedEntry & { id: number; watchedAt: Date }>  // ordenado por fecha desc
watchedCount(): number

// Methods
markWatched(movie: Movie): void      // guarda con new Date().toISOString()
markUnwatched(id: number): void      // elimina la entrada
isWatched(id: number): boolean
clearAll(): void
```

Persiste en `localStorage`. Clave de storage: `'watched_movies'`.

Se guarda `{ date, title, posterUrl, rating }` junto al movieId para que la página `/history` pueda renderizar cada ítem sin llamadas a la API. El tamaño en localStorage es mínimo (~150 bytes por entrada × cientos de películas = pocos KB).

### Toggle en MovieCard

`MovieCardComponent` recibe un nuevo `@Input() isWatched: boolean` y un `@Output() watchedToggled: EventEmitter<Movie>`. El ícono 👁 aparece en la esquina superior derecha junto a ❤️ y 📋. Cuando `isWatched` es `true`, el poster tiene un tinte verde sutil (`ring-2 ring-emerald-500/40`) y aparece el badge "✓ Visto" en la esquina superior izquierda.

### Botón en Detail Page

Debajo del botón "Agregar a watchlist" existente, aparece un botón "Marcar como visto". Si ya está marcada, muestra "Vista el DD/MM/YYYY" con un tinte verde. El botón llama a `facade.toggleWatched(movie)`.

### Página /history

- Ruta: `/history` (lazy-loaded)
- Layout: lista vertical agrupada por mes/año (encabezado de mes en color primario)
- Cada ítem: poster (32×46px) + título + fecha + géneros + rating + botón ✕ para quitar
- Estado vacío: empty state con ícono 📺 y texto "Todavía no marcaste ninguna película como vista"
- Sin paginación — todo el historial se muestra (localStorage, no hay límite de API)

---

## 5. Navegación

### navItems actualizado en AppShellComponent

```typescript
readonly navItems = [
  { path: '/',         label: 'nav.home',     icon: '🏠', exact: true  },
  { path: '/search',   label: 'nav.search',   icon: '🔍', exact: false },
  { path: '/favorites',label: 'nav.favorites', icon: '❤️', exact: false },
  { path: '/watchlist',label: 'nav.watchlist', icon: '📋', exact: false },
  { path: '/history',  label: 'nav.history',  icon: '📺', exact: false },  // NUEVO
] as const
```

En mobile (5 ítems), los iconos bajan a `text-lg` (18px) y los labels a `text-[8px]`. Los touch targets se mantienen en `min-h-[48px]`.

### Traducciones nuevas (es.json / en.json)

```json
// es.json
"nav": { "history": "Historial" },
"history": {
  "title": "Historial",
  "empty": "Todavía no marcaste ninguna película como vista",
  "watchedOn": "Visto el {{date}}",
  "removeFromHistory": "Quitar del historial",
  "clearAll": "Limpiar todo"
},
"filters": {
  "year": "Año",
  "minRating": "Rating mínimo",
  "duration": "Duración",
  "durationAny": "Cualquiera",
  "durationShort": "< 90 min",
  "durationMedium": "90–150 min",
  "durationLong": "> 150 min",
  "clearFilters": "Limpiar filtros",
  "results": "{{count}} resultados"
}
```

---

## 6. Orden de implementación sugerido

1. **TmdbService** — agregar `getNowPlaying`, `getTopRated`, `getUpcoming`, `getGenres`
2. **Stores nuevos** — `NowPlayingStore`, `TopRatedStore`, `UpcomingStore` (copias de TrendingStore)
3. **WatchedStore** — igual que FavoritesStore pero con fecha
4. **Home page** — 4 carouseles + layout sidebar/grilla en el template
5. **HomeFiltersComponent** — géneros dinámicos + RangeSliderComponent + nuevos params en MoviesStore
6. **MovieCard** — toggle "Visto"
7. **Details page** — botón "Marcar como visto"
8. **History page** — `/history` con lista agrupada
9. **AppShell** — 5° nav item + traducciones
10. **i18n** — todas las claves nuevas en es.json y en.json

---

## 7. Lo que NO cambia

- Adapters existentes (`adaptMovie`, `adaptMovieDetail`, `adaptPerson`, `adaptWatchProviders`) — no se tocan
- Conector `withTmdbList<T>()` y `withCallState()` — se usan sin modificar
- `CarouselComponent` y `DragScrollDirective` — ya implementados, se reutilizan
- `BottomSheetComponent` — se reutiliza para mobile filters
- Rutas existentes, guards, interceptors, SEO service — sin cambios

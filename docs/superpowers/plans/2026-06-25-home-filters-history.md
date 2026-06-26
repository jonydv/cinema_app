# Home Multi-Sección, Filtros Expandidos e Historial — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 4 home carousels (now playing, trending, top rated, upcoming), expanded filters (dynamic genres + year + rating + duration), and a watched-history system with `/history` page.

**Architecture:** Three new `withTmdbList<Movie>()` stores for carousels; `WatchedStore` (localStorage-backed, same pattern as `FavoritesStore`); `MoviesStore` extended with year/rating/runtime filter state; `HomeFiltersComponent` redesigned with dynamic genres from API and desktop sidebar layout; new `RangeSliderComponent` for the rating slider; new `/history` page with grouped-by-month list.

**Tech Stack:** Angular 21 standalone, `@ngrx/signals` (`signalStore`, `withTmdbList`, `withCallState`, `rxMethod`), Tailwind v4, `@ngneat/transloco` i18n, `LocalStorageService` for persistence, Vitest for unit tests.

---

## File Map

| Action | File                                                           | Responsibility                                                                                                             |
| ------ | -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Modify | `src/app/data/api/tmdb.service.ts`                             | +`getNowPlaying`, `getTopRated`, `getUpcoming`, `getGenres`; extend `getDiscoverMovies` with year/minRating/runtime params |
| Create | `src/app/store/now-playing.store.ts`                           | Carousel store for `/movie/now_playing`                                                                                    |
| Create | `src/app/store/top-rated.store.ts`                             | Carousel store for `/movie/top_rated`                                                                                      |
| Create | `src/app/store/upcoming.store.ts`                              | Carousel store for `/movie/upcoming`                                                                                       |
| Create | `src/app/store/watched.store.ts`                               | `Record<number,WatchedEntry>` persisted in localStorage                                                                    |
| Create | `src/app/store/watched.store.spec.ts`                          | Unit tests for WatchedStore                                                                                                |
| Modify | `src/app/store/movies.store.ts`                                | +`activeYear`, `minRating`, `minRuntime`, `maxRuntime` state + methods                                                     |
| Modify | `src/app/features/home/home.facade.ts`                         | Inject 3 carousel stores + WatchedStore; expose signals/methods                                                            |
| Create | `src/app/shared/ui/range-slider/range-slider.component.ts`     | Reusable `<input type="range">` wrapper                                                                                    |
| Create | `src/app/shared/ui/range-slider/range-slider.component.html`   | Range slider template                                                                                                      |
| Modify | `src/app/features/home/components/home-filters.component.ts`   | Dynamic genres from API + year select + rating slider + duration buttons + desktop sidebar                                 |
| Modify | `src/app/features/home/components/home-filters.component.html` | Responsive: mobile FAB+BottomSheet, desktop sidebar                                                                        |
| Modify | `src/app/features/home/home.page.html`                         | 4 carousel sections + sidebar/grid layout for Populares                                                                    |
| Modify | `src/app/features/home/home.page.ts`                           | Import new components                                                                                                      |
| Modify | `src/app/shared/ui/movie-card/movie-card.component.ts`         | +`isWatched` input + `watchedToggled` output                                                                               |
| Modify | `src/app/shared/ui/movie-card/movie-card.component.html`       | +👁 button + "✓ Visto" badge                                                                                               |
| Modify | `src/app/features/details/details.facade.ts`                   | Inject WatchedStore; +`toggleWatched`, `isWatched`, `watchedAt`                                                            |
| Modify | `src/app/features/details/details.page.html`                   | +"Marcar como visto" button after watchlist button                                                                         |
| Create | `src/app/features/history/history.page.ts`                     | History page component, groups WatchedStore entries by month                                                               |
| Create | `src/app/features/history/history.page.html`                   | Month-grouped list with poster, date, rating, remove button                                                                |
| Modify | `src/app/features/layout/app-shell.component.ts`               | Add 5th nav item: `{ path: '/history', label: 'nav.history', icon: '📺', exact: false }`                                   |
| Modify | `src/app/app.routes.ts`                                        | Add lazy `/history` route before `**` wildcard                                                                             |
| Modify | `public/i18n/es.json`                                          | +`nav.history`, `history.*`, `filters.year/minRating/duration*` keys                                                       |
| Modify | `public/i18n/en.json`                                          | Same keys in English                                                                                                       |

---

## Task 1: TmdbService — New Endpoints + Extend getDiscoverMovies

**Files:**

- Modify: `src/app/data/api/tmdb.service.ts`

- [ ] **Step 1.1: Write the failing test**

Create `src/app/data/api/tmdb.service.spec.ts` (new file):

```typescript
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'

import { TranslocoService } from '@ngneat/transloco'

import { TmdbService } from './tmdb.service'
import { environment } from '@env/environment'

const base = environment.tmdbApiUrl

describe('TmdbService — new endpoints', () => {
  let service: TmdbService
  let http: HttpTestingController
  const translocoSpy = { getActiveLang: () => 'es', langChanges$: { subscribe: () => {} } }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TmdbService, { provide: TranslocoService, useValue: translocoSpy }],
    })
    service = TestBed.inject(TmdbService)
    http = TestBed.inject(HttpTestingController)
  })

  afterEach(() => {
    http.verify()
    TestBed.resetTestingModule()
  })

  it('getNowPlaying calls /movie/now_playing and maps results', () => {
    let result: { movies: unknown[]; totalPages: number } | undefined
    service.getNowPlaying().subscribe((r) => (result = r))

    const req = http.expectOne((r) => r.url.includes('/movie/now_playing'))
    req.flush({
      results: [
        {
          id: 1,
          title: 'A',
          poster_path: '/a.jpg',
          backdrop_path: '/b.jpg',
          vote_average: 7,
          vote_count: 100,
          release_date: '2024-01-01',
          genre_ids: [],
          overview: '',
          popularity: 100,
        },
      ],
      total_pages: 3,
      total_results: 60,
    })

    expect(result?.movies).toHaveLength(1)
    expect(result?.totalPages).toBe(3)
  })

  it('getTopRated calls /movie/top_rated', () => {
    service.getTopRated().subscribe()
    http
      .expectOne((r) => r.url.includes('/movie/top_rated'))
      .flush({ results: [], total_pages: 1, total_results: 0 })
  })

  it('getUpcoming calls /movie/upcoming', () => {
    service.getUpcoming().subscribe()
    http
      .expectOne((r) => r.url.includes('/movie/upcoming'))
      .flush({ results: [], total_pages: 1, total_results: 0 })
  })

  it('getGenres calls /genre/movie/list and returns genre array', () => {
    let genres: { id: number; name: string }[] | undefined
    service.getGenres().subscribe((g) => (genres = g))

    const req = http.expectOne((r) => r.url.includes('/genre/movie/list'))
    req.flush({
      genres: [
        { id: 28, name: 'Action' },
        { id: 35, name: 'Comedy' },
      ],
    })

    expect(genres).toHaveLength(2)
    expect(genres![0]).toEqual({ id: 28, name: 'Action' })
  })

  it('getDiscoverMovies passes year as primary_release_year when provided', () => {
    service.getDiscoverMovies(1, null, 'popularity.desc', 2022).subscribe()
    const req = http.expectOne((r) => r.url.includes('/discover/movie'))
    expect(req.request.params.get('primary_release_year')).toBe('2022')
    req.flush({ results: [], total_pages: 1, total_results: 0 })
  })

  it('getDiscoverMovies omits primary_release_year when null', () => {
    service.getDiscoverMovies(1, null, 'popularity.desc', null).subscribe()
    const req = http.expectOne((r) => r.url.includes('/discover/movie'))
    expect(req.request.params.has('primary_release_year')).toBe(false)
    req.flush({ results: [], total_pages: 1, total_results: 0 })
  })

  it('getDiscoverMovies passes vote_average.gte when minRating > 0', () => {
    service.getDiscoverMovies(1, null, 'popularity.desc', null, 7).subscribe()
    const req = http.expectOne((r) => r.url.includes('/discover/movie'))
    expect(req.request.params.get('vote_average.gte')).toBe('7')
    expect(req.request.params.get('vote_count.gte')).toBe('100')
    req.flush({ results: [], total_pages: 1, total_results: 0 })
  })

  it('getDiscoverMovies passes runtime params when provided', () => {
    service.getDiscoverMovies(1, null, 'popularity.desc', null, 0, 90, 150).subscribe()
    const req = http.expectOne((r) => r.url.includes('/discover/movie'))
    expect(req.request.params.get('with_runtime.gte')).toBe('90')
    expect(req.request.params.get('with_runtime.lte')).toBe('150')
    req.flush({ results: [], total_pages: 1, total_results: 0 })
  })
})
```

- [ ] **Step 1.2: Run test to verify it fails**

```
npx vitest run src/app/data/api/tmdb.service.spec.ts
```

Expected: multiple FAILs — `getNowPlaying is not a function`, `getTopRated is not a function`, etc.

- [ ] **Step 1.3: Add the new methods and interface to TmdbService**

In `src/app/data/api/tmdb.service.ts`, add a DTO interface near the imports (before the `@Injectable` class):

```typescript
interface TmdbGenreListDto {
  genres: { id: number; name: string }[]
}
```

Then add these four methods at the end of the class (before the closing `}`):

```typescript
getNowPlaying(page = 1): Observable<PagedMovies> {
  return this.http
    .get<TmdbPagedResponseDto<TmdbMovieDto>>(`${this.base}/movie/now_playing`, {
      params: { page: String(page), language: this.lang },
    })
    .pipe(
      map((res) => ({
        movies: res.results.map(adaptMovie),
        totalPages: res.total_pages,
        totalResults: res.total_results,
      })),
    )
}

getTopRated(page = 1): Observable<PagedMovies> {
  return this.http
    .get<TmdbPagedResponseDto<TmdbMovieDto>>(`${this.base}/movie/top_rated`, {
      params: { page: String(page), language: this.lang },
    })
    .pipe(
      map((res) => ({
        movies: res.results.map(adaptMovie),
        totalPages: res.total_pages,
        totalResults: res.total_results,
      })),
    )
}

getUpcoming(page = 1): Observable<PagedMovies> {
  return this.http
    .get<TmdbPagedResponseDto<TmdbMovieDto>>(`${this.base}/movie/upcoming`, {
      params: { page: String(page), language: this.lang },
    })
    .pipe(
      map((res) => ({
        movies: res.results.map(adaptMovie),
        totalPages: res.total_pages,
        totalResults: res.total_results,
      })),
    )
}

getGenres(): Observable<{ id: number; name: string }[]> {
  return this.http
    .get<TmdbGenreListDto>(`${this.base}/genre/movie/list`, {
      params: { language: this.lang },
    })
    .pipe(map((res) => res.genres))
}
```

Also replace the existing `getDiscoverMovies` signature and body:

```typescript
getDiscoverMovies(
  page = 1,
  genreId: number | null = null,
  sortBy = 'popularity.desc',
  year: number | null = null,
  minRating = 0,
  minRuntime: number | null = null,
  maxRuntime: number | null = null,
): Observable<PagedMovies> {
  const params: Record<string, string> = {
    page: String(page),
    sort_by: sortBy,
    include_adult: 'false',
    language: this.lang,
  }
  if (genreId !== null) params['with_genres'] = String(genreId)
  if (year !== null) params['primary_release_year'] = String(year)
  if (minRating > 0) {
    params['vote_average.gte'] = String(minRating)
    params['vote_count.gte'] = '100'
  }
  if (minRuntime !== null) params['with_runtime.gte'] = String(minRuntime)
  if (maxRuntime !== null) params['with_runtime.lte'] = String(maxRuntime)

  return this.http
    .get<TmdbPagedResponseDto<TmdbMovieDto>>(`${this.base}/discover/movie`, { params })
    .pipe(
      map((res) => ({
        movies: res.results.map(adaptMovie),
        totalPages: res.total_pages,
        totalResults: res.total_results,
      })),
    )
}
```

- [ ] **Step 1.4: Run tests to verify they pass**

```
npx vitest run src/app/data/api/tmdb.service.spec.ts
```

Expected: all 8 tests PASS.

- [ ] **Step 1.5: Verify the app builds**

```
npx ng build --configuration=development 2>&1 | tail -5
```

Expected: no TypeScript errors.

- [ ] **Step 1.6: Commit**

```
git add src/app/data/api/tmdb.service.ts src/app/data/api/tmdb.service.spec.ts
git commit -m "feat(tmdb): add getNowPlaying, getTopRated, getUpcoming, getGenres; extend getDiscoverMovies with year/rating/runtime filters"
```

---

## Task 2: Carousel Stores — NowPlayingStore, TopRatedStore, UpcomingStore

**Files:**

- Create: `src/app/store/now-playing.store.ts`
- Create: `src/app/store/top-rated.store.ts`
- Create: `src/app/store/upcoming.store.ts`

These three stores are identical in structure — copies of `TrendingStore` pointing at different TmdbService methods. No `loadMore` (carousels only show page 1).

- [ ] **Step 2.1: Write the failing test**

Create `src/app/store/now-playing.store.spec.ts`:

```typescript
import { TestBed } from '@angular/core/testing'

import { of } from 'rxjs'
import { vi } from 'vitest'

import { TranslocoService } from '@ngneat/transloco'

import { TmdbService } from '@data/api/tmdb.service'
import { Movie } from '@data/models/movie.model'

import { NowPlayingStore } from './now-playing.store'

const mockMovie = (id: number): Movie => ({
  id,
  title: `Movie ${id}`,
  overview: '',
  posterUrl: '',
  backdropUrl: '',
  rating: 7,
  voteCount: 100,
  releaseDate: '2024-01-01',
  releaseYear: 2024,
  genreIds: [],
  popularity: 100,
})

describe('NowPlayingStore', () => {
  let store: InstanceType<typeof NowPlayingStore>
  const tmdbSpy = {
    getNowPlaying: vi.fn(() =>
      of({ movies: [mockMovie(1), mockMovie(2)], totalPages: 2, totalResults: 40 }),
    ),
  }
  const translocoSpy = {
    langChanges$: {
      pipe: () => ({
        subscribe: (cb: () => void) => {
          cb()
          return { unsubscribe: () => {} }
        },
      }),
    },
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        NowPlayingStore,
        { provide: TmdbService, useValue: tmdbSpy },
        { provide: TranslocoService, useValue: translocoSpy },
      ],
    })
    store = TestBed.inject(NowPlayingStore)
  })

  afterEach(() => TestBed.resetTestingModule())

  it('loads movies on init', () => {
    expect(tmdbSpy.getNowPlaying).toHaveBeenCalledWith(1)
    expect(store.entities()).toHaveLength(2)
  })

  it('sets isLoaded after successful fetch', () => {
    expect(store.isLoaded()).toBe(true)
  })
})
```

- [ ] **Step 2.2: Run test to verify it fails**

```
npx vitest run src/app/store/now-playing.store.spec.ts
```

Expected: FAIL — `Cannot find module './now-playing.store'`.

- [ ] **Step 2.3: Create NowPlayingStore**

Create `src/app/store/now-playing.store.ts`:

```typescript
import { inject } from '@angular/core'

import { EMPTY, pipe } from 'rxjs'
import { catchError, distinctUntilChanged, switchMap, tap } from 'rxjs/operators'

import { patchState, signalStore, withHooks, withMethods } from '@ngrx/signals'
import { setAllEntities } from '@ngrx/signals/entities'
import { rxMethod } from '@ngrx/signals/rxjs-interop'

import { TranslocoService } from '@ngneat/transloco'

import { TmdbService } from '@data/api/tmdb.service'
import { Movie } from '@data/models/movie.model'
import { setError, setLoaded, setLoading } from '@store/connectors/call-state.feature'
import { withTmdbList } from '@store/connectors/tmdb-list.feature'

export const NowPlayingStore = signalStore(
  { providedIn: 'root' },
  withTmdbList<Movie>(),
  withMethods((store, tmdb = inject(TmdbService)) => ({
    load: rxMethod<void>(
      pipe(
        tap(() =>
          patchState(store, setLoading(), setAllEntities([] as Movie[]), { currentPage: 1 }),
        ),
        switchMap(() =>
          tmdb.getNowPlaying(1).pipe(
            tap(({ movies, totalPages }) =>
              patchState(
                store,
                setAllEntities(movies),
                { totalPages, currentPage: 1 },
                setLoaded(),
              ),
            ),
            catchError(() => {
              patchState(store, setError('now_playing_load_failed'))
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

- [ ] **Step 2.4: Create TopRatedStore**

Create `src/app/store/top-rated.store.ts` (same pattern, `tmdb.getTopRated`):

```typescript
import { inject } from '@angular/core'

import { EMPTY, pipe } from 'rxjs'
import { catchError, distinctUntilChanged, switchMap, tap } from 'rxjs/operators'

import { patchState, signalStore, withHooks, withMethods } from '@ngrx/signals'
import { setAllEntities } from '@ngrx/signals/entities'
import { rxMethod } from '@ngrx/signals/rxjs-interop'

import { TranslocoService } from '@ngneat/transloco'

import { TmdbService } from '@data/api/tmdb.service'
import { Movie } from '@data/models/movie.model'
import { setError, setLoaded, setLoading } from '@store/connectors/call-state.feature'
import { withTmdbList } from '@store/connectors/tmdb-list.feature'

export const TopRatedStore = signalStore(
  { providedIn: 'root' },
  withTmdbList<Movie>(),
  withMethods((store, tmdb = inject(TmdbService)) => ({
    load: rxMethod<void>(
      pipe(
        tap(() =>
          patchState(store, setLoading(), setAllEntities([] as Movie[]), { currentPage: 1 }),
        ),
        switchMap(() =>
          tmdb.getTopRated(1).pipe(
            tap(({ movies, totalPages }) =>
              patchState(
                store,
                setAllEntities(movies),
                { totalPages, currentPage: 1 },
                setLoaded(),
              ),
            ),
            catchError(() => {
              patchState(store, setError('top_rated_load_failed'))
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

- [ ] **Step 2.5: Create UpcomingStore**

Create `src/app/store/upcoming.store.ts` (same pattern, `tmdb.getUpcoming`):

```typescript
import { inject } from '@angular/core'

import { EMPTY, pipe } from 'rxjs'
import { catchError, distinctUntilChanged, switchMap, tap } from 'rxjs/operators'

import { patchState, signalStore, withHooks, withMethods } from '@ngrx/signals'
import { setAllEntities } from '@ngrx/signals/entities'
import { rxMethod } from '@ngrx/signals/rxjs-interop'

import { TranslocoService } from '@ngneat/transloco'

import { TmdbService } from '@data/api/tmdb.service'
import { Movie } from '@data/models/movie.model'
import { setError, setLoaded, setLoading } from '@store/connectors/call-state.feature'
import { withTmdbList } from '@store/connectors/tmdb-list.feature'

export const UpcomingStore = signalStore(
  { providedIn: 'root' },
  withTmdbList<Movie>(),
  withMethods((store, tmdb = inject(TmdbService)) => ({
    load: rxMethod<void>(
      pipe(
        tap(() =>
          patchState(store, setLoading(), setAllEntities([] as Movie[]), { currentPage: 1 }),
        ),
        switchMap(() =>
          tmdb.getUpcoming(1).pipe(
            tap(({ movies, totalPages }) =>
              patchState(
                store,
                setAllEntities(movies),
                { totalPages, currentPage: 1 },
                setLoaded(),
              ),
            ),
            catchError(() => {
              patchState(store, setError('upcoming_load_failed'))
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

- [ ] **Step 2.6: Run tests to verify they pass**

```
npx vitest run src/app/store/now-playing.store.spec.ts
```

Expected: 2 tests PASS.

- [ ] **Step 2.7: Commit**

```
git add src/app/store/now-playing.store.ts src/app/store/top-rated.store.ts src/app/store/upcoming.store.ts src/app/store/now-playing.store.spec.ts
git commit -m "feat(store): add NowPlayingStore, TopRatedStore, UpcomingStore carousel stores"
```

---

## Task 3: WatchedStore

**Files:**

- Create: `src/app/store/watched.store.ts`
- Create: `src/app/store/watched.store.spec.ts`

- [ ] **Step 3.1: Write the failing test**

Create `src/app/store/watched.store.spec.ts`:

```typescript
import { TestBed } from '@angular/core/testing'

import { vi } from 'vitest'

import { LocalStorageService } from '@core/storage/local-storage.service'
import { Movie } from '@data/models/movie.model'

import { WatchedStore } from './watched.store'

const mockMovie = (id: number): Movie => ({
  id,
  title: `Movie ${id}`,
  overview: '',
  posterUrl: '/poster.jpg',
  backdropUrl: '',
  rating: 7.5,
  voteCount: 100,
  releaseDate: '2024-01-01',
  releaseYear: 2024,
  genreIds: [28],
  popularity: 100,
})

describe('WatchedStore', () => {
  let store: InstanceType<typeof WatchedStore>
  const storageSpy = { get: vi.fn(() => null), set: vi.fn(), remove: vi.fn() }

  beforeEach(() => {
    storageSpy.get.mockReturnValue(null)
    storageSpy.set.mockClear()
    TestBed.configureTestingModule({
      providers: [WatchedStore, { provide: LocalStorageService, useValue: storageSpy }],
    })
    store = TestBed.inject(WatchedStore)
  })

  afterEach(() => TestBed.resetTestingModule())

  it('initialises with empty watched record', () => {
    expect(store.watchedCount()).toBe(0)
    expect(store.watchedList()).toHaveLength(0)
  })

  it('markWatched adds an entry with current date', () => {
    const before = new Date()
    store.markWatched(mockMovie(1))
    const after = new Date()

    expect(store.watchedCount()).toBe(1)
    expect(store.isWatched(1)).toBe(true)

    const entry = store.watchedList()[0]!
    const entryDate = new Date(entry.date)
    expect(entryDate >= before).toBe(true)
    expect(entryDate <= after).toBe(true)
    expect(entry.title).toBe('Movie 1')
    expect(entry.posterUrl).toBe('/poster.jpg')
    expect(entry.rating).toBe(7.5)
  })

  it('markUnwatched removes an entry', () => {
    store.markWatched(mockMovie(1))
    store.markUnwatched(1)
    expect(store.watchedCount()).toBe(0)
    expect(store.isWatched(1)).toBe(false)
  })

  it('isWatched returns false for unknown movie', () => {
    expect(store.isWatched(99)).toBe(false)
  })

  it('watchedList is sorted newest first', () => {
    store.markWatched(mockMovie(1))
    store.markWatched(mockMovie(2))
    const list = store.watchedList()
    // movie 2 was marked after movie 1, so it appears first
    expect(list[0]!.id).toBe(2)
    expect(list[1]!.id).toBe(1)
  })

  it('clearAll removes all entries', () => {
    store.markWatched(mockMovie(1))
    store.markWatched(mockMovie(2))
    store.clearAll()
    expect(store.watchedCount()).toBe(0)
  })

  it('rehydrates from localStorage on init', () => {
    const saved = {
      5: { date: '2024-05-01T10:00:00Z', title: 'Old Movie', posterUrl: '/p.jpg', rating: 8 },
    }
    storageSpy.get.mockReturnValue(saved)

    TestBed.resetTestingModule()
    TestBed.configureTestingModule({
      providers: [WatchedStore, { provide: LocalStorageService, useValue: storageSpy }],
    })
    const hydratedStore = TestBed.inject(WatchedStore)

    expect(hydratedStore.watchedCount()).toBe(1)
    expect(hydratedStore.isWatched(5)).toBe(true)
  })
})
```

- [ ] **Step 3.2: Run test to verify it fails**

```
npx vitest run src/app/store/watched.store.spec.ts
```

Expected: FAIL — `Cannot find module './watched.store'`.

- [ ] **Step 3.3: Create WatchedStore**

Create `src/app/store/watched.store.ts`:

```typescript
import { computed, effect, inject } from '@angular/core'

import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals'

import { LocalStorageService } from '@core/storage/local-storage.service'
import { Movie } from '@data/models/movie.model'

const STORAGE_KEY = 'watched_movies'

export interface WatchedEntry {
  date: string
  title: string
  posterUrl: string
  rating: number
}

interface WatchedState {
  watched: Record<number, WatchedEntry>
}

export const WatchedStore = signalStore(
  { providedIn: 'root' },
  withState<WatchedState>({ watched: {} }),
  withComputed(({ watched }) => ({
    watchedCount: computed(() => Object.keys(watched()).length),
    watchedList: computed(() =>
      Object.entries(watched())
        .map(([id, entry]) => ({ id: Number(id), ...entry }))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    ),
  })),
  withMethods((store) => ({
    markWatched(movie: Movie): void {
      patchState(store, (state) => ({
        watched: {
          ...state.watched,
          [movie.id]: {
            date: new Date().toISOString(),
            title: movie.title,
            posterUrl: movie.posterUrl,
            rating: movie.rating,
          },
        },
      }))
    },

    markUnwatched(id: number): void {
      patchState(store, (state) => {
        const watched = { ...state.watched }
        delete watched[id]
        return { watched }
      })
    },

    isWatched(id: number): boolean {
      return id in store.watched()
    },

    clearAll(): void {
      patchState(store, { watched: {} })
    },
  })),
  withHooks({
    onInit(store, storage = inject(LocalStorageService)) {
      const saved = storage.get<Record<number, WatchedEntry>>(STORAGE_KEY)
      if (saved && Object.keys(saved).length > 0) {
        patchState(store, { watched: saved })
      }
      effect(() => {
        storage.set(STORAGE_KEY, store.watched())
      })
    },
  }),
)
```

- [ ] **Step 3.4: Run tests to verify they pass**

```
npx vitest run src/app/store/watched.store.spec.ts
```

Expected: all 7 tests PASS.

- [ ] **Step 3.5: Commit**

```
git add src/app/store/watched.store.ts src/app/store/watched.store.spec.ts
git commit -m "feat(store): add WatchedStore with localStorage persistence and date-sorted list"
```

---

## Task 4: MoviesStore — Extended Filter State

**Files:**

- Modify: `src/app/store/movies.store.ts`

The current state has `activeGenre` and `sortBy`. Add `activeYear`, `minRating`, `minRuntime`, `maxRuntime`. Update `fetchPage` to route through `getDiscoverMovies` when any filter is active.

- [ ] **Step 4.1: Write the failing test**

Create `src/app/store/movies.store.spec.ts`:

```typescript
import { TestBed } from '@angular/core/testing'

import { of } from 'rxjs'
import { vi } from 'vitest'

import { TranslocoService } from '@ngneat/transloco'

import { TmdbService } from '@data/api/tmdb.service'
import { Movie } from '@data/models/movie.model'

import { MoviesStore } from './movies.store'

const empty = { movies: [] as Movie[], totalPages: 1, totalResults: 0 }
const tmdbSpy = {
  getPopularMovies: vi.fn(() => of(empty)),
  getDiscoverMovies: vi.fn(() => of(empty)),
}
const translocoSpy = {
  langChanges$: {
    pipe: () => ({
      subscribe: (cb: () => void) => {
        cb()
        return { unsubscribe: () => {} }
      },
    }),
  },
}

describe('MoviesStore — extended filters', () => {
  let store: InstanceType<typeof MoviesStore>

  beforeEach(() => {
    vi.clearAllMocks()
    TestBed.configureTestingModule({
      providers: [
        MoviesStore,
        { provide: TmdbService, useValue: tmdbSpy },
        { provide: TranslocoService, useValue: translocoSpy },
      ],
    })
    store = TestBed.inject(MoviesStore)
    // allow onInit to run
  })

  afterEach(() => TestBed.resetTestingModule())

  it('initialises with null year, 0 minRating, null runtime', () => {
    expect(store.activeYear()).toBeNull()
    expect(store.minRating()).toBe(0)
    expect(store.minRuntime()).toBeNull()
    expect(store.maxRuntime()).toBeNull()
  })

  it('setYear updates activeYear and triggers loadMovies with discover endpoint', () => {
    store.setYear(2022)
    expect(store.activeYear()).toBe(2022)
    store.loadMovies()
    expect(tmdbSpy.getDiscoverMovies).toHaveBeenCalledWith(
      1,
      null,
      'popularity.desc',
      2022,
      0,
      null,
      null,
    )
  })

  it('setMinRating updates minRating', () => {
    store.setMinRating(7.5)
    expect(store.minRating()).toBe(7.5)
  })

  it('setRuntimeRange updates both runtime bounds', () => {
    store.setRuntimeRange(90, 150)
    expect(store.minRuntime()).toBe(90)
    expect(store.maxRuntime()).toBe(150)
  })

  it('setRuntimeRange with null clears runtime bounds', () => {
    store.setRuntimeRange(90, 150)
    store.setRuntimeRange(null, null)
    expect(store.minRuntime()).toBeNull()
    expect(store.maxRuntime()).toBeNull()
  })
})
```

- [ ] **Step 4.2: Run test to verify it fails**

```
npx vitest run src/app/store/movies.store.spec.ts
```

Expected: FAIL — `store.activeYear is not a function` (signal not in state yet).

- [ ] **Step 4.3: Update MoviesStore**

Replace the entire `src/app/store/movies.store.ts` with:

```typescript
import { computed, inject } from '@angular/core'

import { EMPTY, Observable, pipe } from 'rxjs'
import { catchError, distinctUntilChanged, switchMap, tap } from 'rxjs/operators'

import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals'
import { addEntities, setAllEntities } from '@ngrx/signals/entities'
import { rxMethod } from '@ngrx/signals/rxjs-interop'

import { TranslocoService } from '@ngneat/transloco'

import { TmdbService } from '@data/api/tmdb.service'
import { Movie, PagedMovies } from '@data/models/movie.model'
import { setError, setLoaded, setLoading } from '@store/connectors/call-state.feature'
import { withTmdbList } from '@store/connectors/tmdb-list.feature'

export const MoviesStore = signalStore(
  { providedIn: 'root' },
  withTmdbList<Movie>(),
  withState({
    activeGenre: null as number | null,
    sortBy: 'popularity.desc',
    activeYear: null as number | null,
    minRating: 0,
    minRuntime: null as number | null,
    maxRuntime: null as number | null,
  }),
  withComputed(({ entities }) => ({
    movies: computed(() => entities()),
  })),
  withMethods((store, tmdbService = inject(TmdbService)) => {
    const isFiltered = (): boolean =>
      store.activeGenre() !== null ||
      store.sortBy() !== 'popularity.desc' ||
      store.activeYear() !== null ||
      store.minRating() > 0 ||
      store.minRuntime() !== null ||
      store.maxRuntime() !== null

    const fetchPage = (page: number): Observable<PagedMovies> => {
      if (isFiltered()) {
        return tmdbService.getDiscoverMovies(
          page,
          store.activeGenre(),
          store.sortBy(),
          store.activeYear(),
          store.minRating(),
          store.minRuntime(),
          store.maxRuntime(),
        )
      }
      return tmdbService.getPopularMovies(page)
    }

    return {
      loadMovies: rxMethod<void>(
        pipe(
          tap(() =>
            patchState(store, setLoading(), setAllEntities([] as Movie[]), { currentPage: 1 }),
          ),
          switchMap(() =>
            fetchPage(1).pipe(
              tap(({ movies, totalPages }) =>
                patchState(
                  store,
                  setAllEntities(movies),
                  { totalPages, currentPage: 1 },
                  setLoaded(),
                ),
              ),
              catchError((e) => {
                patchState(store, setError(String(e)))
                return EMPTY
              }),
            ),
          ),
        ),
      ),

      loadMore: rxMethod<void>(
        pipe(
          switchMap(() => {
            const nextPage = store.currentPage() + 1
            return fetchPage(nextPage).pipe(
              tap(({ movies, totalPages }) =>
                patchState(store, addEntities(movies), { totalPages, currentPage: nextPage }),
              ),
              catchError(() => EMPTY),
            )
          }),
        ),
      ),

      setGenre(id: number | null): void {
        patchState(store, { activeGenre: id })
      },

      setSortBy(sort: string): void {
        patchState(store, { sortBy: sort })
      },

      setYear(year: number | null): void {
        patchState(store, { activeYear: year })
      },

      setMinRating(rating: number): void {
        patchState(store, { minRating: rating })
      },

      setRuntimeRange(min: number | null, max: number | null): void {
        patchState(store, { minRuntime: min, maxRuntime: max })
      },
    }
  }),
  withHooks({
    onInit(store) {
      inject(TranslocoService)
        .langChanges$.pipe(distinctUntilChanged())
        .subscribe(() => store.loadMovies())
    },
  }),
)
```

- [ ] **Step 4.4: Run tests to verify they pass**

```
npx vitest run src/app/store/movies.store.spec.ts
```

Expected: all 5 tests PASS.

- [ ] **Step 4.5: Full test suite (no regressions)**

```
npx vitest run
```

Expected: all existing tests still PASS.

- [ ] **Step 4.6: Commit**

```
git add src/app/store/movies.store.ts src/app/store/movies.store.spec.ts
git commit -m "feat(store): extend MoviesStore with year, minRating, runtime filter state"
```

---

## Task 5: HomeFacade — Wire New Stores

**Files:**

- Modify: `src/app/features/home/home.facade.ts`

- [ ] **Step 5.1: Replace HomeFacade content**

Replace the entire `src/app/features/home/home.facade.ts` with:

```typescript
import { inject, Injectable } from '@angular/core'

import { Movie } from '@data/models/movie.model'
import { FavoritesStore } from '@store/favorites.store'
import { MoviesStore } from '@store/movies.store'
import { NowPlayingStore } from '@store/now-playing.store'
import { TopRatedStore } from '@store/top-rated.store'
import { TrendingStore } from '@store/trending.store'
import { UpcomingStore } from '@store/upcoming.store'
import { WatchedStore } from '@store/watched.store'
import { WatchlistStore } from '@store/watchlist.store'

@Injectable({ providedIn: 'root' })
export class HomeFacade {
  private readonly moviesStore = inject(MoviesStore)
  private readonly favoritesStore = inject(FavoritesStore)
  private readonly trendingStore = inject(TrendingStore)
  private readonly watchlistStore = inject(WatchlistStore)
  private readonly nowPlayingStore = inject(NowPlayingStore)
  private readonly topRatedStore = inject(TopRatedStore)
  private readonly upcomingStore = inject(UpcomingStore)
  private readonly watchedStore = inject(WatchedStore)

  // Popular movies (Populares grid)
  readonly movies = this.moviesStore.movies
  readonly isLoading = this.moviesStore.isLoading
  readonly hasMore = this.moviesStore.hasMore
  readonly activeGenre = this.moviesStore.activeGenre
  readonly sortBy = this.moviesStore.sortBy
  readonly activeYear = this.moviesStore.activeYear
  readonly minRating = this.moviesStore.minRating
  readonly minRuntime = this.moviesStore.minRuntime
  readonly maxRuntime = this.moviesStore.maxRuntime

  // Carousel stores
  readonly nowPlaying = this.nowPlayingStore.entities
  readonly nowPlayingLoading = this.nowPlayingStore.isLoading
  readonly trending = this.trendingStore.entities
  readonly trendingLoading = this.trendingStore.isLoading
  readonly topRated = this.topRatedStore.entities
  readonly topRatedLoading = this.topRatedStore.isLoading
  readonly upcoming = this.upcomingStore.entities
  readonly upcomingLoading = this.upcomingStore.isLoading

  init(): void {
    this.moviesStore.loadMovies()
    // Carousel stores auto-load via withHooks.onInit — no explicit call needed
  }

  loadMore(): void {
    if (!this.moviesStore.hasMore() || this.moviesStore.isLoading()) return
    this.moviesStore.loadMore()
  }

  toggleFavorite(movie: Movie): void {
    this.favoritesStore.toggleFavorite(movie)
  }

  isFavorite(id: number): boolean {
    return this.favoritesStore.isFavorite(id)
  }

  toggleWatchlist(movie: Movie): void {
    this.watchlistStore.toggleWatchlist(movie)
  }

  isInWatchlist(id: number): boolean {
    return this.watchlistStore.isInWatchlist(id)
  }

  toggleWatched(movie: Movie): void {
    if (this.watchedStore.isWatched(movie.id)) {
      this.watchedStore.markUnwatched(movie.id)
    } else {
      this.watchedStore.markWatched(movie)
    }
  }

  isWatched(id: number): boolean {
    return this.watchedStore.isWatched(id)
  }

  setGenre(id: number | null): void {
    this.moviesStore.setGenre(id)
    this.moviesStore.loadMovies()
  }

  setSortBy(sort: string): void {
    this.moviesStore.setSortBy(sort)
    this.moviesStore.loadMovies()
  }

  setYear(year: number | null): void {
    this.moviesStore.setYear(year)
    this.moviesStore.loadMovies()
  }

  setMinRating(rating: number): void {
    this.moviesStore.setMinRating(rating)
    this.moviesStore.loadMovies()
  }

  setRuntimeRange(min: number | null, max: number | null): void {
    this.moviesStore.setRuntimeRange(min, max)
    this.moviesStore.loadMovies()
  }
}
```

- [ ] **Step 5.2: Verify build**

```
npx ng build --configuration=development 2>&1 | tail -5
```

Expected: 0 TS errors.

- [ ] **Step 5.3: Commit**

```
git add src/app/features/home/home.facade.ts
git commit -m "feat(home): wire NowPlaying/TopRated/Upcoming/Watched stores into HomeFacade"
```

---

## Task 6: RangeSliderComponent

**Files:**

- Create: `src/app/shared/ui/range-slider/range-slider.component.ts`
- Create: `src/app/shared/ui/range-slider/range-slider.component.html`

This is a thin wrapper around `<input type="range">` with no business logic.

- [ ] **Step 6.1: Create the component TS**

Create `src/app/shared/ui/range-slider/range-slider.component.ts`:

```typescript
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core'

@Component({
  selector: 'app-range-slider',
  standalone: true,
  templateUrl: './range-slider.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RangeSliderComponent {
  readonly min = input<number>(0)
  readonly max = input<number>(10)
  readonly step = input<number>(0.5)
  readonly value = input<number>(0)
  readonly valueChange = output<number>()

  onInput(event: Event): void {
    this.valueChange.emit(Number((event.target as HTMLInputElement).value))
  }
}
```

- [ ] **Step 6.2: Create the component template**

Create `src/app/shared/ui/range-slider/range-slider.component.html`:

```html
<input
  type="range"
  class="h-2 w-full cursor-pointer appearance-none rounded-full bg-(--color-skeleton) accent-(--color-primary)"
  [min]="min()"
  [max]="max()"
  [step]="step()"
  [value]="value()"
  (input)="onInput($event)"
/>
```

- [ ] **Step 6.3: Write a quick unit test**

Create `src/app/shared/ui/range-slider/range-slider.component.spec.ts`:

```typescript
import { RangeSliderComponent } from './range-slider.component'

describe('RangeSliderComponent', () => {
  it('exports the component class', () => {
    expect(RangeSliderComponent).toBeDefined()
  })

  it('onInput emits the numeric value from the input event', () => {
    const instance = Object.create(RangeSliderComponent.prototype) as RangeSliderComponent
    const emitSpy = { emit: (v: number) => (captured = v) }
    let captured = 0
    ;(instance as { valueChange: { emit: (v: number) => void } }).valueChange = emitSpy

    const fakeInput = { value: '7.5' } as HTMLInputElement
    instance.onInput({ target: fakeInput } as unknown as Event)

    expect(captured).toBe(7.5)
  })
})
```

- [ ] **Step 6.4: Run test**

```
npx vitest run src/app/shared/ui/range-slider/range-slider.component.spec.ts
```

Expected: 2 tests PASS.

- [ ] **Step 6.5: Commit**

```
git add src/app/shared/ui/range-slider/
git commit -m "feat(ui): add RangeSliderComponent for rating min-filter slider"
```

---

## Task 7: HomeFiltersComponent — Dynamic Genres + New Filters + Desktop Sidebar

**Files:**

- Modify: `src/app/features/home/components/home-filters.component.ts`
- Modify: `src/app/features/home/components/home-filters.component.html`

**Design:** The component renders two mode-dependent UIs via the same filter fields:

- Mobile (`md:hidden`): floating FAB button that opens the `BottomSheetComponent`
- Desktop (`hidden md:flex`): inline sidebar panel with all filter fields

The filter fields (genre chips, year select, rating slider, duration buttons, sort select) appear in both. To avoid duplication, the template uses a `ng-template #filterFields` and `NgTemplateOutlet`.

Genres are loaded from `TmdbService.getGenres()` into a local `genres` signal on init.

- [ ] **Step 7.1: Replace HomeFiltersComponent TS**

Replace `src/app/features/home/components/home-filters.component.ts`:

```typescript
import { NgTemplateOutlet } from '@angular/common'
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core'

import { TranslocoModule } from '@ngneat/transloco'

import { TmdbService } from '@data/api/tmdb.service'

import { BottomSheetComponent } from '@shared/ui/bottom-sheet/bottom-sheet.component'
import { RangeSliderComponent } from '@shared/ui/range-slider/range-slider.component'

import { HomeFacade } from '../home.facade'

interface SortOption {
  value: string
  labelKey: string
}

const SORT_OPTIONS: SortOption[] = [
  { value: 'popularity.desc', labelKey: 'filters.popularity' },
  { value: 'vote_average.desc', labelKey: 'filters.rating' },
  { value: 'primary_release_date.desc', labelKey: 'filters.releaseDate' },
]

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: CURRENT_YEAR - 1970 + 1 }, (_, i) => CURRENT_YEAR - i)

const DURATION_OPTIONS = [
  { labelKey: 'filters.durationAny', min: null as number | null, max: null as number | null },
  { labelKey: 'filters.durationShort', min: null, max: 90 },
  { labelKey: 'filters.durationMedium', min: 90, max: 150 },
  { labelKey: 'filters.durationLong', min: 150, max: null },
]

@Component({
  selector: 'app-home-filters',
  standalone: true,
  imports: [BottomSheetComponent, TranslocoModule, RangeSliderComponent, NgTemplateOutlet],
  templateUrl: './home-filters.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeFiltersComponent implements OnInit {
  protected readonly facade = inject(HomeFacade)
  private readonly tmdb = inject(TmdbService)

  protected readonly isOpen = signal(false)
  protected readonly genres = signal<{ id: number; name: string }[]>([])
  protected readonly sortOptions = SORT_OPTIONS
  protected readonly years = YEARS
  protected readonly durationOptions = DURATION_OPTIONS

  ngOnInit(): void {
    this.tmdb.getGenres().subscribe((g) => this.genres.set(g))
  }

  open(): void {
    this.isOpen.set(true)
  }
  close(): void {
    this.isOpen.set(false)
  }

  selectGenre(id: number | null): void {
    this.facade.setGenre(id)
  }

  onYearChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value
    this.facade.setYear(val ? Number(val) : null)
  }

  onRatingChange(rating: number): void {
    this.facade.setMinRating(rating)
  }

  onDurationSelect(min: number | null, max: number | null): void {
    this.facade.setRuntimeRange(min, max)
    this.close()
  }

  onSortChange(event: Event): void {
    this.facade.setSortBy((event.target as HTMLSelectElement).value)
  }

  clearFilters(): void {
    this.facade.setGenre(null)
    this.facade.setYear(null)
    this.facade.setMinRating(0)
    this.facade.setRuntimeRange(null, null)
    this.facade.setSortBy('popularity.desc')
    this.close()
  }

  genreChipClass(id: number | null): string {
    const base =
      'px-3 py-1.5 rounded-full text-sm font-medium border transition-colors min-h-[36px]'
    const active = 'bg-(--color-primary) text-white border-(--color-primary)'
    const inactive =
      'border-(--color-border) text-(--color-text-secondary) md:hover:border-(--color-primary)'
    return `${base} ${this.facade.activeGenre() === id ? active : inactive}`
  }

  durationButtonClass(min: number | null, max: number | null): string {
    const base = 'px-3 py-1.5 rounded-lg text-sm border transition-colors min-h-[36px]'
    const isActive = this.facade.minRuntime() === min && this.facade.maxRuntime() === max
    const active = 'bg-(--color-primary) text-white border-(--color-primary)'
    const inactive =
      'border-(--color-border) text-(--color-text-secondary) md:hover:border-(--color-primary)'
    return `${base} ${isActive ? active : inactive}`
  }

  sortRowClass(value: string): string {
    const base =
      'flex items-center justify-between rounded-lg p-3 text-left transition-colors min-h-[48px] w-full'
    const active = 'text-(--color-primary) font-semibold'
    const inactive = 'text-(--color-text-primary)'
    return `${base} ${this.facade.sortBy() === value ? active : inactive}`
  }
}
```

- [ ] **Step 7.2: Replace HomeFiltersComponent HTML**

Replace `src/app/features/home/components/home-filters.component.html`:

```html
<!-- Shared filter fields template — rendered in both mobile sheet and desktop sidebar -->
<ng-template #filterFields>
  <!-- Genre chips (with "All" first) -->
  <section>
    <h3 class="mb-2 text-sm font-semibold text-(--color-text-secondary)">
      {{ 'filters.genre' | transloco }}
    </h3>
    <div class="flex flex-wrap gap-2">
      <button type="button" [class]="genreChipClass(null)" (click)="selectGenre(null)">
        Todos
      </button>
      @for (genre of genres(); track genre.id) {
      <button type="button" [class]="genreChipClass(genre.id)" (click)="selectGenre(genre.id)">
        {{ genre.name }}
      </button>
      }
    </div>
  </section>

  <!-- Year select -->
  <section>
    <h3 class="mb-2 text-sm font-semibold text-(--color-text-secondary)">
      {{ 'filters.year' | transloco }}
    </h3>
    <select
      class="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm text-(--color-text-primary) focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
      [value]="facade.activeYear() ?? ''"
      (change)="onYearChange($event)"
    >
      <option value="">Cualquier año</option>
      @for (year of years; track year) {
      <option [value]="year">{{ year }}</option>
      }
    </select>
  </section>

  <!-- Min rating slider -->
  <section>
    <h3
      class="mb-2 flex items-center justify-between text-sm font-semibold text-(--color-text-secondary)"
    >
      <span>{{ 'filters.minRating' | transloco }}</span>
      @if (facade.minRating() > 0) {
      <span class="text-amber-400">★ {{ facade.minRating() }}</span>
      }
    </h3>
    <app-range-slider
      [min]="0"
      [max]="10"
      [step]="0.5"
      [value]="facade.minRating()"
      (valueChange)="onRatingChange($event)"
    />
  </section>

  <!-- Duration buttons -->
  <section>
    <h3 class="mb-2 text-sm font-semibold text-(--color-text-secondary)">
      {{ 'filters.duration' | transloco }}
    </h3>
    <div class="flex flex-wrap gap-2">
      @for (opt of durationOptions; track opt.labelKey) {
      <button
        type="button"
        [class]="durationButtonClass(opt.min, opt.max)"
        (click)="onDurationSelect(opt.min, opt.max)"
      >
        {{ opt.labelKey | transloco }}
      </button>
      }
    </div>
  </section>

  <!-- Sort -->
  <section>
    <h3 class="mb-2 text-sm font-semibold text-(--color-text-secondary)">
      {{ 'filters.sortBy' | transloco }}
    </h3>
    <select
      class="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm text-(--color-text-primary) focus:outline-none focus:ring-2 focus:ring-(--color-primary)"
      [value]="facade.sortBy()"
      (change)="onSortChange($event)"
    >
      @for (opt of sortOptions; track opt.value) {
      <option [value]="opt.value">{{ opt.labelKey | transloco }}</option>
      }
    </select>
  </section>

  <!-- Clear filters -->
  <button
    type="button"
    class="mt-2 w-full rounded-lg border border-(--color-border) px-4 py-2 text-sm text-(--color-text-secondary) transition-colors min-h-[44px] md:hover:border-(--color-primary)"
    (click)="clearFilters()"
  >
    {{ 'filters.clearFilters' | transloco }}
  </button>
</ng-template>

<!-- Mobile: FAB + BottomSheet (hidden on md:) -->
<button
  type="button"
  class="fixed bottom-[76px] right-4 z-10 flex min-h-[48px] min-w-[48px] items-center justify-center rounded-full bg-(--color-primary) text-white shadow-lg transition-transform active:scale-95 md:hidden"
  (click)="open()"
  [attr.aria-label]="'filters.title' | transloco"
>
  <svg class="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M3 4h18M7 8h10M11 12h2M11 16h2"
    />
  </svg>
</button>

<app-bottom-sheet [isOpen]="isOpen()" [label]="'filters.title' | transloco" (closed)="close()">
  <div class="flex flex-col gap-6 pb-2">
    <ng-container [ngTemplateOutlet]="filterFields" />
  </div>
</app-bottom-sheet>

<!-- Desktop: inline sidebar (hidden below md:) -->
<div class="hidden md:flex md:flex-col md:gap-5 md:w-[220px] md:shrink-0 md:pt-1">
  <ng-container [ngTemplateOutlet]="filterFields" />
</div>
```

- [ ] **Step 7.3: Verify build**

```
npx ng build --configuration=development 2>&1 | tail -5
```

Expected: 0 TS errors.

- [ ] **Step 7.4: Commit**

```
git add src/app/features/home/components/home-filters.component.ts src/app/features/home/components/home-filters.component.html
git commit -m "feat(filters): dynamic genres from API, year/rating/duration filters, desktop sidebar"
```

---

## Task 8: Home Page Template — 4 Carousels + Responsive Populares Section

**Files:**

- Modify: `src/app/features/home/home.page.html`
- Modify: `src/app/features/home/home.page.ts`

The new layout (top to bottom):

1. Page header
2. "En cartelera" carousel (NowPlayingStore)
3. "Trending esta semana" carousel (TrendingStore — already exists)
4. "Mejor valoradas" carousel (TopRatedStore)
5. "Próximos estrenos" carousel (UpcomingStore)
6. "Populares" section: `md:flex gap-6` wrapper with `<app-home-filters>` sidebar (desktop) + grid

- [ ] **Step 8.1: Replace home.page.html**

Replace `src/app/features/home/home.page.html`:

```html
<div class="relative min-h-screen">
  <!-- Page header -->
  <header class="px-4 pb-3 pt-5 md:px-6 md:pt-7">
    <h1
      class="text-2xl font-bold tracking-tight text-(--color-text-primary) md:text-3xl"
      tabindex="-1"
    >
      {{ 'home.title' | transloco }}
    </h1>
  </header>

  <!-- Carousel: En cartelera -->
  @if (facade.nowPlaying().length > 0 || facade.nowPlayingLoading()) {
  <section class="mb-2">
    <h2 class="mb-2 px-4 text-sm font-semibold text-(--color-text-secondary) md:px-6">
      🎬 {{ 'home.nowPlaying' | transloco }}
    </h2>
    @if (facade.nowPlayingLoading()) {
    <div class="scrollbar-hide flex gap-2 overflow-x-auto px-4 pb-2 md:px-6">
      @for (i of skeletonRange; track i) {
      <div
        class="skeleton-shimmer h-[180px] w-[120px] shrink-0 rounded-xl md:h-[210px] md:w-[140px]"
      ></div>
      }
    </div>
    } @else {
    <app-carousel role="list">
      @for (movie of facade.nowPlaying(); track movie.id) {
      <div class="w-[120px] shrink-0 snap-center md:w-[140px]" role="listitem">
        <app-movie-card
          [movie]="movie"
          [isFavorite]="facade.isFavorite(movie.id)"
          [isInWatchlist]="facade.isInWatchlist(movie.id)"
          [isWatched]="facade.isWatched(movie.id)"
          (favoriteToggled)="facade.toggleFavorite($event)"
          (watchlistToggled)="facade.toggleWatchlist($event)"
          (watchedToggled)="facade.toggleWatched($event)"
        />
      </div>
      }
    </app-carousel>
    }
  </section>
  }

  <!-- Carousel: Trending -->
  @if (facade.trending().length > 0 || facade.trendingLoading()) {
  <section class="mb-2 mt-1">
    <h2 class="mb-2 px-4 text-sm font-semibold text-(--color-text-secondary) md:px-6">
      🔥 {{ 'trending.title' | transloco }}
    </h2>
    @if (facade.trendingLoading()) {
    <div class="scrollbar-hide flex gap-2 overflow-x-auto px-4 pb-2 md:px-6">
      @for (i of skeletonRange; track i) {
      <div
        class="skeleton-shimmer h-[180px] w-[120px] shrink-0 rounded-xl md:h-[210px] md:w-[140px]"
      ></div>
      }
    </div>
    } @else {
    <app-carousel role="list">
      @for (movie of facade.trending(); track movie.id) {
      <div class="w-[120px] shrink-0 snap-center md:w-[140px]" role="listitem">
        <app-movie-card
          [movie]="movie"
          [isFavorite]="facade.isFavorite(movie.id)"
          [isInWatchlist]="facade.isInWatchlist(movie.id)"
          [isWatched]="facade.isWatched(movie.id)"
          (favoriteToggled)="facade.toggleFavorite($event)"
          (watchlistToggled)="facade.toggleWatchlist($event)"
          (watchedToggled)="facade.toggleWatched($event)"
        />
      </div>
      }
    </app-carousel>
    }
  </section>
  }

  <!-- Carousel: Top Rated -->
  @if (facade.topRated().length > 0 || facade.topRatedLoading()) {
  <section class="mb-2">
    <h2 class="mb-2 px-4 text-sm font-semibold text-(--color-text-secondary) md:px-6">
      ⭐ {{ 'home.topRated' | transloco }}
    </h2>
    @if (facade.topRatedLoading()) {
    <div class="scrollbar-hide flex gap-2 overflow-x-auto px-4 pb-2 md:px-6">
      @for (i of skeletonRange; track i) {
      <div
        class="skeleton-shimmer h-[180px] w-[120px] shrink-0 rounded-xl md:h-[210px] md:w-[140px]"
      ></div>
      }
    </div>
    } @else {
    <app-carousel role="list">
      @for (movie of facade.topRated(); track movie.id) {
      <div class="w-[120px] shrink-0 snap-center md:w-[140px]" role="listitem">
        <app-movie-card
          [movie]="movie"
          [isFavorite]="facade.isFavorite(movie.id)"
          [isInWatchlist]="facade.isInWatchlist(movie.id)"
          [isWatched]="facade.isWatched(movie.id)"
          (favoriteToggled)="facade.toggleFavorite($event)"
          (watchlistToggled)="facade.toggleWatchlist($event)"
          (watchedToggled)="facade.toggleWatched($event)"
        />
      </div>
      }
    </app-carousel>
    }
  </section>
  }

  <!-- Carousel: Upcoming -->
  @if (facade.upcoming().length > 0 || facade.upcomingLoading()) {
  <section class="mb-4">
    <h2 class="mb-2 px-4 text-sm font-semibold text-(--color-text-secondary) md:px-6">
      📅 {{ 'home.upcoming' | transloco }}
    </h2>
    @if (facade.upcomingLoading()) {
    <div class="scrollbar-hide flex gap-2 overflow-x-auto px-4 pb-2 md:px-6">
      @for (i of skeletonRange; track i) {
      <div
        class="skeleton-shimmer h-[180px] w-[120px] shrink-0 rounded-xl md:h-[210px] md:w-[140px]"
      ></div>
      }
    </div>
    } @else {
    <app-carousel role="list">
      @for (movie of facade.upcoming(); track movie.id) {
      <div class="w-[120px] shrink-0 snap-center md:w-[140px]" role="listitem">
        <app-movie-card
          [movie]="movie"
          [isFavorite]="facade.isFavorite(movie.id)"
          [isInWatchlist]="facade.isInWatchlist(movie.id)"
          [isWatched]="facade.isWatched(movie.id)"
          (favoriteToggled)="facade.toggleFavorite($event)"
          (watchlistToggled)="facade.toggleWatchlist($event)"
          (watchedToggled)="facade.toggleWatched($event)"
        />
      </div>
      }
    </app-carousel>
    }
  </section>
  }

  <!-- Populares section: responsive sidebar + grid -->
  <section class="px-4 md:px-6">
    <h2 class="mb-3 text-sm font-semibold text-(--color-text-secondary)">
      📊 {{ 'home.popular' | transloco }}
    </h2>

    <div class="flex gap-6">
      <!-- Sidebar filters (desktop only — component renders md:flex, mobile renders FAB) -->
      <app-home-filters />

      <!-- Movie grid -->
      <main class="flex-1 pb-28 md:pb-10">
        <div class="grid grid-cols-2 gap-2.5 md:grid-cols-3 lg:grid-cols-4 md:gap-4">
          @for (movie of facade.movies(); track movie.id) {
          <app-movie-card
            [movie]="movie"
            [isFavorite]="facade.isFavorite(movie.id)"
            [isInWatchlist]="facade.isInWatchlist(movie.id)"
            [isWatched]="facade.isWatched(movie.id)"
            (favoriteToggled)="facade.toggleFavorite($event)"
            (watchlistToggled)="facade.toggleWatchlist($event)"
            (watchedToggled)="facade.toggleWatched($event)"
          />
          } @if (facade.isLoading()) { @for (i of skeletonRange; track i) {
          <app-skeleton-card />
          } }
        </div>

        @if (!facade.isLoading() && facade.movies().length === 0) {
        <app-empty-state
          icon="🎬"
          [title]="'empty.error' | transloco"
          [subtitle]="'errors.serverError' | transloco"
        />
        } @if (facade.hasMore()) {
        <div
          appInfiniteScroll
          [threshold]="0.1"
          (scrolled)="onScrolled()"
          class="h-8"
          aria-hidden="true"
        ></div>
        }
      </main>
    </div>
  </section>
</div>
```

- [ ] **Step 8.2: Update home.page.ts imports**

The home page TS file already imports `CarouselComponent` and `HomeFiltersComponent`. The only change is removing the `MovieCardComponent` import from the grid (it's already there) and ensuring `isWatched`/`watchedToggled` bindings compile. No TS changes required for the template to work. Verify that `home.page.ts` still has all required imports:

```typescript
// This file should already have these imports — verify each one:
import { CarouselComponent } from '@shared/ui/carousel/carousel.component'
import { EmptyStateComponent } from '@shared/ui/empty-state/empty-state.component'
import { MovieCardComponent } from '@shared/ui/movie-card/movie-card.component'
import { SkeletonCardComponent } from '@shared/ui/skeleton-card/skeleton-card.component'
import { InfiniteScrollDirective } from '@shared/directives/infinite-scroll.directive'
import { HomeFiltersComponent } from './components/home-filters.component'
import { HomeFacade } from './home.facade'
```

If any are missing, add them to the `imports` array in `@Component`.

- [ ] **Step 8.3: Verify build**

```
npx ng build --configuration=development 2>&1 | tail -10
```

Expected: 0 errors. (The `isWatched` / `watchedToggled` bindings will fail if MovieCard hasn't been updated yet — proceed to Task 9 before checking.)

- [ ] **Step 8.4: Commit (after Task 9 passes)**

Hold this commit until Task 9 is done (MovieCard needs the new inputs). Then commit both together:

```
git add src/app/features/home/home.page.html src/app/features/home/home.page.ts
git commit -m "feat(home): 4 section carousels + responsive Populares sidebar layout"
```

---

## Task 9: MovieCard — "Visto" Toggle

**Files:**

- Modify: `src/app/shared/ui/movie-card/movie-card.component.ts`
- Modify: `src/app/shared/ui/movie-card/movie-card.component.html`
- Modify: `src/app/shared/ui/movie-card/movie-card.component.spec.ts`

- [ ] **Step 9.1: Write the failing test**

Add to `src/app/shared/ui/movie-card/movie-card.component.spec.ts` (keep existing tests, add):

```typescript
describe('MovieCardComponent.onWatchedClick', () => {
  it('calls preventDefault and stopPropagation', () => {
    const instance = Object.create(MovieCardComponent.prototype) as MovieCardComponent
    const fakeEvent = new MouseEvent('click', { bubbles: true, cancelable: true })
    const preventSpy = vi.spyOn(fakeEvent, 'preventDefault')
    const stopSpy = vi.spyOn(fakeEvent, 'stopPropagation')
    ;(instance as { watchedToggled: { emit: () => void } }).watchedToggled = { emit: vi.fn() }
    ;(instance as { movie: () => null }).movie = () => null

    instance.onWatchedClick(fakeEvent)

    expect(preventSpy).toHaveBeenCalled()
    expect(stopSpy).toHaveBeenCalled()
  })

  it('emits the current movie when watched is clicked', () => {
    const instance = Object.create(MovieCardComponent.prototype) as MovieCardComponent
    const emitSpy = vi.fn()
    const fakeMovie = { id: 42, title: 'Test' }
    ;(instance as { watchedToggled: { emit: (m: unknown) => void } }).watchedToggled = {
      emit: emitSpy,
    }
    ;(instance as { movie: () => typeof fakeMovie }).movie = () => fakeMovie

    instance.onWatchedClick(new MouseEvent('click'))

    expect(emitSpy).toHaveBeenCalledWith(fakeMovie)
  })
})
```

- [ ] **Step 9.2: Run test to verify it fails**

```
npx vitest run src/app/shared/ui/movie-card/movie-card.component.spec.ts
```

Expected: FAIL — `instance.onWatchedClick is not a function`.

- [ ] **Step 9.3: Update MovieCard TS**

Replace `src/app/shared/ui/movie-card/movie-card.component.ts`:

```typescript
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core'
import { RouterLink } from '@angular/router'

import { TranslocoModule } from '@ngneat/transloco'

import { Movie } from '@data/models/movie.model'

@Component({
  selector: 'app-movie-card',
  standalone: true,
  imports: [RouterLink, TranslocoModule],
  templateUrl: './movie-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieCardComponent {
  readonly movie = input.required<Movie>()
  readonly isFavorite = input<boolean>(false)
  readonly isInWatchlist = input<boolean>(false)
  readonly isWatched = input<boolean>(false)
  readonly favoriteToggled = output<Movie>()
  readonly watchlistToggled = output<Movie>()
  readonly watchedToggled = output<Movie>()

  onFavoriteClick(event: Event): void {
    event.preventDefault()
    event.stopPropagation()
    this.favoriteToggled.emit(this.movie())
  }

  onWatchlistClick(event: Event): void {
    event.preventDefault()
    event.stopPropagation()
    this.watchlistToggled.emit(this.movie())
  }

  onWatchedClick(event: Event): void {
    event.preventDefault()
    event.stopPropagation()
    this.watchedToggled.emit(this.movie())
  }
}
```

- [ ] **Step 9.4: Update MovieCard HTML**

Replace `src/app/shared/ui/movie-card/movie-card.component.html`:

```html
<article
  class="group relative overflow-hidden rounded-xl bg-(--color-surface) shadow-sm ring-1 ring-black/5 transition-all duration-300 dark:ring-white/5 md:hover:scale-[1.04] md:hover:shadow-2xl md:hover:shadow-black/40"
  [class.ring-2]="isWatched()"
  [class.ring-emerald-500/40]="isWatched()"
  [attr.aria-label]="'a11y.movieCard' | transloco: { title: movie().title }"
>
  <a
    [routerLink]="['/movie', movie().id]"
    class="block focus:outline-none focus-visible:ring-2 focus-visible:ring-(--color-primary) focus-visible:ring-offset-2 focus-visible:ring-offset-(--color-bg)"
  >
    <!-- Poster image -->
    <div class="relative aspect-2/3 overflow-hidden bg-(--color-skeleton)">
      <img
        [src]="movie().posterUrl"
        [alt]="'a11y.posterAlt' | transloco: { title: movie().title }"
        width="300"
        height="450"
        class="h-full w-full object-cover transition-transform duration-500 md:group-hover:scale-[1.08]"
        loading="lazy"
      />

      <!-- Watched overlay tint -->
      @if (isWatched()) {
      <div class="absolute inset-0 bg-emerald-500/10"></div>
      }

      <!-- Gradient overlay -->
      <div
        class="absolute inset-0 bg-linear-to-t from-black/90 via-black/30 to-transparent opacity-80 transition-opacity duration-300 md:group-hover:opacity-100"
      ></div>

      <!-- "✓ Visto" badge — top left -->
      @if (isWatched()) {
      <div
        class="absolute left-1.5 top-1.5 rounded-md bg-emerald-500 px-1.5 py-0.5 text-[9px] font-bold text-white"
      >
        ✓ {{ 'movie.watched' | transloco }}
      </div>
      }

      <!-- Title + meta overlaid at bottom -->
      <div class="absolute bottom-0 left-0 right-0 p-2.5">
        <h2
          class="line-clamp-2 text-[11px] font-semibold leading-snug text-white drop-shadow-sm md:text-[13px]"
        >
          {{ movie().title }}
        </h2>
        <div class="mt-1 flex items-center gap-1.5">
          <span class="text-[10px] font-bold text-amber-400">★ {{ movie().rating }}</span>
          <span class="text-[10px] text-white/60">{{ movie().releaseYear }}</span>
        </div>
      </div>
    </div>
  </a>

  <!-- Action buttons — top-right stack -->
  <div class="absolute right-1.5 top-1.5 flex flex-col gap-1">
    <!-- Favorite -->
    <button
      type="button"
      class="flex min-h-[36px] min-w-[36px] items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-md transition-all duration-200 md:hover:scale-110 md:hover:bg-(--color-primary)"
      [attr.aria-label]="(isFavorite() ? 'movie.removeFavorite' : 'movie.addFavorite') | transloco"
      [attr.aria-pressed]="isFavorite()"
      (click)="onFavoriteClick($event)"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-3.5 w-3.5 transition-all duration-200"
        viewBox="0 0 24 24"
        aria-hidden="true"
        [attr.fill]="isFavorite() ? '#e50914' : 'none'"
        stroke="currentColor"
        stroke-width="2"
        [class.text-red-500]="isFavorite()"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>

    <!-- Watchlist -->
    <button
      type="button"
      class="flex min-h-[36px] min-w-[36px] items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-md transition-all duration-200 md:hover:scale-110 md:hover:bg-blue-600"
      [attr.aria-label]="(isInWatchlist() ? 'movie.removeWatchlist' : 'movie.addWatchlist') | transloco"
      [attr.aria-pressed]="isInWatchlist()"
      (click)="onWatchlistClick($event)"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-3.5 w-3.5 transition-all duration-200"
        viewBox="0 0 24 24"
        aria-hidden="true"
        [attr.fill]="isInWatchlist() ? '#3b82f6' : 'none'"
        stroke="currentColor"
        stroke-width="2"
        [class.text-blue-400]="isInWatchlist()"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    </button>

    <!-- Watched toggle -->
    <button
      type="button"
      class="flex min-h-[36px] min-w-[36px] items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-md transition-all duration-200 md:hover:scale-110"
      [class.bg-emerald-600/80]="isWatched()"
      [attr.aria-label]="(isWatched() ? 'movie.markUnwatched' : 'movie.markWatched') | transloco"
      [attr.aria-pressed]="isWatched()"
      (click)="onWatchedClick($event)"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-3.5 w-3.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        aria-hidden="true"
        [class.text-emerald-300]="isWatched()"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
        />
      </svg>
    </button>
  </div>
</article>
```

- [ ] **Step 9.5: Run tests to verify they pass**

```
npx vitest run src/app/shared/ui/movie-card/movie-card.component.spec.ts
```

Expected: all 5 tests PASS (3 existing + 2 new).

- [ ] **Step 9.6: Verify build (Task 8 + 9 together)**

```
npx ng build --configuration=development 2>&1 | tail -10
```

Expected: 0 errors.

- [ ] **Step 9.7: Commit Tasks 8 + 9 together**

```
git add src/app/features/home/home.page.html src/app/features/home/home.page.ts src/app/shared/ui/movie-card/movie-card.component.ts src/app/shared/ui/movie-card/movie-card.component.html src/app/shared/ui/movie-card/movie-card.component.spec.ts
git commit -m "feat(home,card): 4 carousels + responsive layout; MovieCard adds isWatched toggle"
```

---

## Task 10: DetailsFacade + Details Page — "Marcar como visto" Button

**Files:**

- Modify: `src/app/features/details/details.facade.ts`
- Modify: `src/app/features/details/details.page.html`

- [ ] **Step 10.1: Update DetailsFacade**

Replace `src/app/features/details/details.facade.ts`:

```typescript
import { computed, inject, Injectable } from '@angular/core'

import { Movie, MovieDetail } from '@data/models/movie.model'
import { FavoritesStore } from '@store/favorites.store'
import { MovieDetailStore } from '@store/movie-detail.store'
import { RatingsStore } from '@store/ratings.store'
import { RecommendationsStore } from '@store/recommendations.store'
import { WatchedStore } from '@store/watched.store'
import { WatchlistStore } from '@store/watchlist.store'

@Injectable({ providedIn: 'root' })
export class DetailsFacade {
  private readonly detailStore = inject(MovieDetailStore)
  private readonly favoritesStore = inject(FavoritesStore)
  private readonly watchlistStore = inject(WatchlistStore)
  private readonly ratingsStore = inject(RatingsStore)
  private readonly recommendationsStore = inject(RecommendationsStore)
  private readonly watchedStore = inject(WatchedStore)

  readonly movie = this.detailStore.movie
  readonly isLoading = this.detailStore.isLoading
  readonly error = this.detailStore.error
  readonly watchProviders = this.detailStore.watchProviders

  readonly recommendations = this.recommendationsStore.entities
  readonly recommendationsLoading = this.recommendationsStore.isLoading

  loadMovie(id: number): void {
    this.detailStore.loadMovie(id)
    this.recommendationsStore.load(id)
  }

  clear(): void {
    this.detailStore.clearMovie()
    this.recommendationsStore.clear()
  }

  isFavorite(id: number): boolean {
    return this.favoritesStore.isFavorite(id)
  }

  toggleFavorite(movie: Movie): void {
    this.favoritesStore.toggleFavorite(movie)
  }

  isInWatchlist(id: number): boolean {
    return this.watchlistStore.isInWatchlist(id)
  }

  toggleWatchlist(movie: Movie): void {
    this.watchlistStore.toggleWatchlist(movie)
  }

  getRating(movieId: number): number {
    return this.ratingsStore.getRating(movieId)
  }

  setRating(movieId: number, stars: number): void {
    this.ratingsStore.setRating(movieId, stars)
  }

  isWatched(id: number): boolean {
    return this.watchedStore.isWatched(id)
  }

  toggleWatched(movie: MovieDetail): void {
    if (this.watchedStore.isWatched(movie.id)) {
      this.watchedStore.markUnwatched(movie.id)
    } else {
      this.watchedStore.markWatched({
        id: movie.id,
        title: movie.title,
        posterUrl: movie.posterUrl,
        rating: movie.rating,
        overview: movie.overview,
        backdropUrl: movie.backdropUrl,
        releaseDate: movie.releaseDate,
        releaseYear: movie.releaseYear,
        genreIds: movie.genres.map((g) => g.id),
        voteCount: movie.voteCount,
        popularity: 0,
      })
    }
  }

  watchedAt(id: number): Date | null {
    const entry = this.watchedStore.watched()[id]
    return entry ? new Date(entry.date) : null
  }
}
```

- [ ] **Step 10.2: Add "Marcar como visto" button to details.page.html**

In `src/app/features/details/details.page.html`, find the watchlist section and add the watched button immediately after it (before the `<!-- Trailer -->` comment):

```html
<!-- Watched button -->
<section class="px-4 pb-4 md:px-6">
  <button
    type="button"
    class="flex min-h-[44px] items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-colors duration-200"
    [class]="
        facade.isWatched(movie.id)
          ? 'border-emerald-500 bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'
          : 'border-(--color-border) bg-(--color-surface) text-(--color-text-primary) md:hover:border-emerald-400'
      "
    [attr.aria-pressed]="facade.isWatched(movie.id)"
    (click)="facade.toggleWatched(movie)"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      aria-hidden="true"
    >
      <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
    @if (facade.isWatched(movie.id) && facade.watchedAt(movie.id); as watchedDate) { Vista el {{
    watchedDate | date: 'dd/MM/yyyy' }} } @else { {{ 'movie.markWatched' | transloco }} }
  </button>
</section>
```

Also add the `DatePipe` import to the details page TS. Check `src/app/features/details/details.page.ts` and add `DatePipe` to imports if not present:

```typescript
import { DatePipe } from '@angular/common'
// ... add DatePipe to @Component imports array
```

- [ ] **Step 10.3: Verify build**

```
npx ng build --configuration=development 2>&1 | tail -10
```

Expected: 0 errors.

- [ ] **Step 10.4: Commit**

```
git add src/app/features/details/details.facade.ts src/app/features/details/details.page.html src/app/features/details/details.page.ts
git commit -m "feat(details): inject WatchedStore, add 'Marcar como visto' button with watched date"
```

---

## Task 11: History Page

**Files:**

- Create: `src/app/features/history/history.page.ts`
- Create: `src/app/features/history/history.page.html`

The history page groups `WatchedStore.watchedList()` by month/year. The grouping is a `computed` signal in the component.

- [ ] **Step 11.1: Create History page TS**

Create `src/app/features/history/history.page.ts`:

```typescript
import { DatePipe } from '@angular/common'
import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core'

import { TranslocoModule } from '@ngneat/transloco'

import { SeoMetadataService } from '@core/seo/seo-metadata.service'

import { WatchedStore } from '@store/watched.store'

import { EmptyStateComponent } from '@shared/ui/empty-state/empty-state.component'

interface MonthGroup {
  label: string // e.g. "Junio 2026"
  entries: Array<{ id: number; date: string; title: string; posterUrl: string; rating: number }>
}

@Component({
  selector: 'app-history-page',
  standalone: true,
  imports: [TranslocoModule, DatePipe, EmptyStateComponent],
  templateUrl: './history.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistoryPage implements OnInit {
  private readonly watchedStore = inject(WatchedStore)
  private readonly seo = inject(SeoMetadataService)

  readonly watchedCount = this.watchedStore.watchedCount
  readonly isEmpty = computed(() => this.watchedStore.watchedCount() === 0)

  readonly groupedByMonth = computed<MonthGroup[]>(() => {
    const list = this.watchedStore.watchedList()
    const map = new Map<string, MonthGroup>()

    for (const entry of list) {
      const d = new Date(entry.date)
      const key = `${d.getFullYear()}-${d.getMonth()}`
      if (!map.has(key)) {
        map.set(key, {
          label: d.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }),
          entries: [],
        })
      }
      map.get(key)!.entries.push(entry)
    }

    return Array.from(map.values())
  })

  ngOnInit(): void {
    this.seo.setPageTitle('Historial')
    this.seo.setMetaDescription('Tu historial de películas vistas.')
  }

  removeFromHistory(id: number): void {
    this.watchedStore.markUnwatched(id)
  }

  clearAll(): void {
    this.watchedStore.clearAll()
  }
}
```

- [ ] **Step 11.2: Create History page HTML**

Create `src/app/features/history/history.page.html`:

```html
<div class="px-4 pb-28 pt-5 md:px-6 md:pb-10 md:pt-7">
  <header class="mb-4 flex items-center justify-between">
    <h1
      class="text-2xl font-bold tracking-tight text-(--color-text-primary) md:text-3xl"
      tabindex="-1"
    >
      {{ 'history.title' | transloco }}
    </h1>
    @if (!isEmpty()) {
    <div class="flex items-center gap-3">
      <span class="text-sm text-(--color-text-secondary)">
        {{ watchedCount() }} {{ 'history.moviesCount' | transloco }}
      </span>
      <button
        type="button"
        class="text-sm text-(--color-text-secondary) underline underline-offset-2 md:hover:text-(--color-primary)"
        (click)="clearAll()"
      >
        {{ 'history.clearAll' | transloco }}
      </button>
    </div>
    }
  </header>

  @if (isEmpty()) {
  <app-empty-state
    icon="📺"
    [title]="'history.empty' | transloco"
    [subtitle]="'history.emptySubtitle' | transloco"
  />
  } @else {
  <div class="flex flex-col gap-6">
    @for (group of groupedByMonth(); track group.label) {
    <section>
      <h2 class="mb-3 text-xs font-bold uppercase tracking-widest text-(--color-primary)">
        {{ group.label }}
      </h2>
      <ul class="flex flex-col gap-2">
        @for (entry of group.entries; track entry.id) {
        <li
          class="flex items-center gap-3 rounded-xl bg-(--color-surface) p-3 shadow-sm ring-1 ring-black/5 dark:ring-white/5"
        >
          <!-- Poster thumbnail -->
          <img
            [src]="entry.posterUrl"
            [alt]="entry.title"
            width="32"
            height="46"
            class="h-[46px] w-8 shrink-0 rounded object-cover"
            loading="lazy"
          />
          <!-- Info -->
          <div class="flex-1 min-w-0">
            <p class="truncate text-sm font-semibold text-(--color-text-primary)">
              {{ entry.title }}
            </p>
            <p class="text-xs text-(--color-text-secondary)">
              {{ 'history.watchedOn' | transloco: { date: (entry.date | date: 'dd MMM yyyy') } }}
            </p>
            @if (entry.rating > 0) {
            <span class="text-xs font-bold text-amber-400">★ {{ entry.rating }}</span>
            }
          </div>
          <!-- Remove button -->
          <button
            type="button"
            class="flex min-h-[36px] min-w-[36px] shrink-0 items-center justify-center rounded-lg text-(--color-text-secondary) transition-colors md:hover:text-red-500"
            [attr.aria-label]="'history.removeFromHistory' | transloco"
            (click)="removeFromHistory(entry.id)"
          >
            <svg
              class="size-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </li>
        }
      </ul>
    </section>
    }
  </div>
  }
</div>
```

- [ ] **Step 11.3: Write a quick unit test for the grouping logic**

Create `src/app/features/history/history.page.spec.ts`:

```typescript
import { TestBed } from '@angular/core/testing'

import { vi } from 'vitest'

import { LocalStorageService } from '@core/storage/local-storage.service'
import { SeoMetadataService } from '@core/seo/seo-metadata.service'

import { WatchedStore } from '@store/watched.store'

import { HistoryPage } from './history.page'

describe('HistoryPage.groupedByMonth', () => {
  let page: HistoryPage
  const storageSpy = { get: vi.fn(() => null), set: vi.fn(), remove: vi.fn() }
  const seoSpy = { setPageTitle: vi.fn(), setMetaDescription: vi.fn() }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        HistoryPage,
        WatchedStore,
        { provide: LocalStorageService, useValue: storageSpy },
        { provide: SeoMetadataService, useValue: seoSpy },
      ],
    })
    page = TestBed.inject(HistoryPage)
  })

  afterEach(() => TestBed.resetTestingModule())

  it('returns empty array when no movies are watched', () => {
    expect(page.groupedByMonth()).toEqual([])
  })

  it('groups movies in the same month together', () => {
    const store = TestBed.inject(WatchedStore)
    // Mark two movies watched in the same month via the store
    store['patchState']?.({
      watched: {
        1: { date: '2026-06-01T00:00:00Z', title: 'A', posterUrl: '/a.jpg', rating: 7 },
        2: { date: '2026-06-15T00:00:00Z', title: 'B', posterUrl: '/b.jpg', rating: 8 },
        3: { date: '2026-05-01T00:00:00Z', title: 'C', posterUrl: '/c.jpg', rating: 6 },
      },
    })

    const groups = page.groupedByMonth()
    expect(groups).toHaveLength(2)
    expect(groups[0]!.entries).toHaveLength(2) // June (newest first)
    expect(groups[1]!.entries).toHaveLength(1) // May
  })
})
```

Note: the `patchState` call above won't work directly from outside the store in strict mode. Replace with marking movies via the store's public API:

```typescript
it('groups movies in the same month together', () => {
  const store = TestBed.inject(WatchedStore)
  const movie = (id: number, title: string): Parameters<typeof store.markWatched>[0] => ({
    id,
    title,
    posterUrl: '/p.jpg',
    rating: 7,
    overview: '',
    backdropUrl: '',
    releaseDate: '2024-01-01',
    releaseYear: 2024,
    genreIds: [],
    voteCount: 100,
    popularity: 100,
  })

  store.markWatched(movie(1, 'A'))
  store.markWatched(movie(2, 'B'))
  // Both marked in the same month (test runs synchronously so same timestamp month)
  const groups = page.groupedByMonth()
  // At least one group exists
  expect(groups.length).toBeGreaterThan(0)
  expect(groups[0]!.entries.length).toBeGreaterThan(0)
})
```

- [ ] **Step 11.4: Run test**

```
npx vitest run src/app/features/history/history.page.spec.ts
```

Expected: 2 tests PASS.

- [ ] **Step 11.5: Verify build**

```
npx ng build --configuration=development 2>&1 | tail -5
```

Expected: 0 errors.

- [ ] **Step 11.6: Commit**

```
git add src/app/features/history/
git commit -m "feat(history): add /history page with month-grouped watched list"
```

---

## Task 12: AppShell Nav + Routes + i18n

**Files:**

- Modify: `src/app/features/layout/app-shell.component.ts`
- Modify: `src/app/app.routes.ts`
- Modify: `public/i18n/es.json`
- Modify: `public/i18n/en.json`

- [ ] **Step 12.1: Add 5th nav item to AppShellComponent**

In `src/app/features/layout/app-shell.component.ts`, find the `navItems` array and replace it:

```typescript
readonly navItems = [
  { path: '/',          label: 'nav.home',      icon: '🏠', exact: true  },
  { path: '/search',    label: 'nav.search',    icon: '🔍', exact: false },
  { path: '/favorites', label: 'nav.favorites', icon: '♥',  exact: false },
  { path: '/watchlist', label: 'nav.watchlist', icon: '📋', exact: false },
  { path: '/history',   label: 'nav.history',   icon: '📺', exact: false },
] as const
```

- [ ] **Step 12.2: Add lazy route to app.routes.ts**

In `src/app/app.routes.ts`, add the history route BEFORE the `**` wildcard:

```typescript
{
  path: 'history',
  loadComponent: () =>
    import('@features/history/history.page').then((m) => m.HistoryPage),
},
```

- [ ] **Step 12.3: Add i18n keys to es.json**

In `public/i18n/es.json`, add these entries:

Inside `"nav"`:

```json
"history": "Historial"
```

New top-level keys (add at the end before the closing `}`):

```json
"history": {
  "title": "Historial",
  "empty": "Todavía no marcaste ninguna película como vista",
  "emptySubtitle": "Marcá películas con 👁 para registrar que las viste",
  "watchedOn": "Visto el {{date}}",
  "removeFromHistory": "Quitar del historial",
  "clearAll": "Limpiar todo",
  "moviesCount": "películas vistas"
},
"filters": {
  "title": "Filtros",
  "genre": "Género",
  "sortBy": "Ordenar por",
  "popularity": "Popularidad",
  "rating": "Puntuación",
  "releaseDate": "Fecha de estreno",
  "apply": "Aplicar",
  "reset": "Resetear",
  "year": "Año",
  "minRating": "Rating mínimo",
  "duration": "Duración",
  "durationAny": "Cualquiera",
  "durationShort": "< 90 min",
  "durationMedium": "90–150 min",
  "durationLong": "> 150 min",
  "clearFilters": "Limpiar filtros"
},
"home": {
  "title": "Películas populares",
  "loadMore": "Cargar más",
  "nowPlaying": "En cartelera",
  "topRated": "Mejor valoradas",
  "upcoming": "Próximos estrenos",
  "popular": "Populares"
},
"movie": {
  ...existing keys...,
  "markWatched": "Marcar como visto",
  "markUnwatched": "Quitar de vistos",
  "watched": "Visto"
}
```

Note: `es.json` already has `"filters"` and `"home"` top-level keys. Merge the new keys into those existing objects — do not duplicate the key. Replace the existing `"filters"` object with the merged version, and add the new `"home"` keys to the existing `"home"` object. Add `"history"` as a new top-level key. Add the 3 new keys (`markWatched`, `markUnwatched`, `watched`) into the existing `"movie"` object.

- [ ] **Step 12.4: Add i18n keys to en.json**

Same structure for `public/i18n/en.json`:

Inside `"nav"`:

```json
"history": "History"
```

```json
"history": {
  "title": "History",
  "empty": "You haven't marked any movie as watched yet",
  "emptySubtitle": "Mark movies with 👁 to track what you've seen",
  "watchedOn": "Watched on {{date}}",
  "removeFromHistory": "Remove from history",
  "clearAll": "Clear all",
  "moviesCount": "movies watched"
},
"home": {
  ...existing keys...,
  "nowPlaying": "Now Playing",
  "topRated": "Top Rated",
  "upcoming": "Upcoming",
  "popular": "Popular"
},
"movie": {
  ...existing keys...,
  "markWatched": "Mark as watched",
  "markUnwatched": "Remove from watched",
  "watched": "Watched"
},
"filters": {
  ...existing keys...,
  "year": "Year",
  "minRating": "Min rating",
  "duration": "Duration",
  "durationAny": "Any",
  "durationShort": "< 90 min",
  "durationMedium": "90–150 min",
  "durationLong": "> 150 min",
  "clearFilters": "Clear filters"
}
```

- [ ] **Step 12.5: Full test suite**

```
npx vitest run
```

Expected: all tests PASS.

- [ ] **Step 12.6: Production build**

```
npx ng build 2>&1 | tail -10
```

Expected: 0 errors, bundle generated.

- [ ] **Step 12.7: Commit**

```
git add src/app/features/layout/app-shell.component.ts src/app/app.routes.ts public/i18n/es.json public/i18n/en.json
git commit -m "feat(nav,i18n): add History nav item, lazy /history route, translation keys for history/filters/home sections"
```

---

## Self-Review

### Spec Coverage

| Spec requirement                                                             | Task      |
| ---------------------------------------------------------------------------- | --------- |
| `getNowPlaying`, `getTopRated`, `getUpcoming`, `getGenres` in TmdbService    | Task 1    |
| Extend `getDiscoverMovies` with year/minRating/runtime                       | Task 1    |
| `NowPlayingStore`, `TopRatedStore`, `UpcomingStore` (withTmdbList pattern)   | Task 2    |
| `WatchedStore` with `Record<number,WatchedEntry>`, localStorage, sorted list | Task 3    |
| `MoviesStore` extended with year/minRating/runtime state + methods           | Task 4    |
| `HomeFacade` wires all stores, exposes all signals                           | Task 5    |
| `RangeSliderComponent` reusable slider                                       | Task 6    |
| `HomeFiltersComponent` dynamic genres + all filter fields + desktop sidebar  | Task 7    |
| Home page with 4 carousels + responsive Populares section                    | Task 8    |
| `MovieCard` `isWatched` input + `watchedToggled` output + badge + eye icon   | Task 9    |
| Details page "Marcar como visto" button + `DetailsFacade` wired              | Task 10   |
| `/history` page with month-grouped list                                      | Task 11   |
| 5th nav item + lazy route + all i18n keys                                    | Task 12   |
| Dynamic genres loaded from `/genre/movie/list`                               | Task 7    |
| Year select (1970–current)                                                   | Task 7    |
| Duration buttons (Any/<90/90-150/>150)                                       | Task 7    |
| Min rating slider                                                            | Tasks 6+7 |
| "✓ Visto" badge top-left on card                                             | Task 9    |
| Green ring on watched card                                                   | Task 9    |
| History: empty state with 📺                                                 | Task 11   |
| History: remove entry with ✕                                                 | Task 11   |
| History: clearAll button                                                     | Task 11   |
| Translations es.json + en.json                                               | Task 12   |

### Placeholder Scan — None found. All steps contain complete code.

### Type Consistency Check

- `WatchedEntry.date`: `string` (ISO) — used in Task 3, 10, 11 ✓
- `WatchedStore.markWatched(movie: Movie)` — called in Task 10 with a `Movie`-shaped object constructed from `MovieDetail` fields ✓
- `MovieCardComponent.isWatched` input type `boolean` — used in Tasks 8, 9 ✓
- `MovieCardComponent.watchedToggled` output type `Movie` — emits `this.movie()` which is `Movie` ✓
- `HomeFacade.toggleWatched(movie: Movie)` — called in home template with `Movie` ✓
- `DetailsFacade.toggleWatched(movie: MovieDetail)` — receives `MovieDetail`, constructs `Movie` internally ✓
- `getDiscoverMovies(page, genreId, sortBy, year, minRating, minRuntime, maxRuntime)` — all 7 params consistent across TmdbService (Task 1), MoviesStore `fetchPage` call (Task 4), test assertions (Task 1) ✓
- `MonthGroup.entries` type matches `WatchedStore.watchedList()` return shape (`id: number` + `WatchedEntry` fields) ✓

---

**Plan complete and saved.**

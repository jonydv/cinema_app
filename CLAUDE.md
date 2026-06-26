# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status

Angular 21 movie app (cinema app) — actively developed. Source lives at the repository root (`src/`, `angular.json`, etc.).

## Commands

```bash
ng serve          # Dev server
ng build          # Production build
npx vitest run    # Unit tests
ng lint           # Lint
```

## Architecture

Clean Architecture with 5 layers under `src/app/`:

```
core/       # Global singletons: HTTP interceptor, theme service, SEO service
data/       # TMDB API: DTOs (snake_case), adapters (DTO→Model), HttpClient service
store/      # @ngrx/signals stores: movies list state, movie detail state
features/   # Smart components/pages: layout shell, home, details
shared/     # Dumb UI components: movie-card, skeleton-card, bottom-sheet, youtube-player
```

**Dependency rule**: Inner layers (`data/models`) must never import from outer layers (`features`, `shared`).

## Data Flow

```
features (Smart Components)
  → injects Facade service
    → reads/writes @ngrx/signals Store
      → Store calls tmdb.service.ts (HttpClient)
        → response passes through movie.adapter.ts (DTO → internal Model)
          → Store updates Signal → UI re-renders
```

The `auth-api.interceptor.ts` in `core/` automatically injects `Authorization: Bearer <TOKEN>` **only** for requests targeting `api.themoviedb.org` — never for analytics or other third-party domains.

## Key Patterns

**Adapter (Anti-corruption layer)**: TMDB returns `snake_case` DTOs (`poster_path`, `vote_average`). `movie.adapter.ts` transforms these to camelCase internal models (`posterUrl`, `rating`) and concatenates the TMDB image base URL. Components only ever touch internal models.

**Smart vs Dumb components**: `features/` components inject the Facade and own business logic. `shared/ui/` components only accept `@Input()` and emit `@Output()` — no service injection.

**Facade pattern**: Feature components call a single Facade service rather than injecting the store and HTTP service separately.

## Mobile-First Rules

All base Tailwind classes (no prefix) target mobile (iPhone SE viewport). Desktop behavior is added with `md:` and `lg:` modifiers.

Critical constraints:

- **Hover**: Never use bare `hover:` classes. Use `md:hover:` or `@media (hover: hover)` — iOS "sticks" hover state after touch.
- **Touch targets**: Minimum `min-h-[48px] min-w-[48px]` on all interactive elements.
- **Navigation**: Base CSS renders a `fixed bottom-0` Bottom Tab Bar; `md:` classes mutate it into a Top Navbar.
- **Filters**: FAB + Bottom Sheet on mobile (`bottom-sheet` component in `shared/ui/`); plain sidebar on `md:`.
- **Movie grid**: `grid-cols-2 gap-2` base; `md:grid-cols-4 lg:grid-cols-5 md:gap-6` for desktop.

## API Key Security

- API key lives in `environment.ts`, injected at build time by Vercel/CI — never hardcoded.
- `auth-api.interceptor.ts` is the internal guard (prevents key leaking to other domains).
- Production TMDB dashboard must have an HTTP Referrer Restriction set to the production domain — this is the only real external defense for a SPA.

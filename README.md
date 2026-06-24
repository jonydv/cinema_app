# MovieApp v2

[![CI](https://github.com/jonatandavidvillalba/movie-app-v2/actions/workflows/ci.yml/badge.svg)](https://github.com/jonatandavidvillalba/movie-app-v2/actions/workflows/ci.yml)

A mobile-first Angular 21 movie browser powered by the TMDB API, with SSR, PWA support, and i18n (ES/EN).

## Tech Stack

| Layer     | Technology                            |
| --------- | ------------------------------------- |
| Framework | Angular 21 (standalone, SSR, signals) |
| State     | @ngrx/signals                         |
| Styling   | Tailwind CSS v4                       |
| i18n      | @ngneat/transloco (ES / EN)           |
| Testing   | Vitest + jsdom                        |
| CI        | GitHub Actions                        |
| Hosting   | Vercel (SSR via Express)              |

## Architecture

Clean Architecture with 5 layers under `src/app/`:

```
core/       Global singletons: HTTP interceptors, theme, SEO, toast, storage
data/       TMDB DTOs, adapters (DTO→Model), HttpClient service
store/      @ngrx/signals stores: movies list, movie detail, favorites, search
features/   Smart pages: home, details, search, favorites, layout shell
shared/     Dumb UI: movie-card, skeleton-card, youtube-player, empty-state...
```

**Dependency rule**: inner layers (`data/models`) never import from outer layers.

### Data Flow

```
Feature component → Facade service → Signal store → TmdbService
  → HTTP interceptors (auth, retry, error) → TMDB API
  → MovieAdapter (DTO→Model) → Store signals → UI re-renders
```

## Getting Started

### Prerequisites

- Node.js 22+
- A TMDB Bearer token from [themoviedb.org](https://www.themoviedb.org/settings/api)

### Local development

```bash
# 1. Install dependencies
npm install

# 2. Add your TMDB token to a local .env file
echo "TMDB_BEARER_TOKEN=eyJ..." > .env

# 3. Generate environment files and start dev server
npm start
```

### Commands

```bash
npm test              # Unit tests (vitest, ~1.5 s)
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
npm run lint          # ESLint
npm run format        # Prettier
npm run build:prod    # Production SSR build
npm run serve:ssr     # Serve the production build locally
```

## Key Patterns

**Adapter / anti-corruption layer** — TMDB returns `snake_case` DTOs (`poster_path`, `vote_average`). `movie.adapter.ts` maps them to camelCase internal models and prepends the TMDB CDN URL. Components only touch internal models.

**Facade** — Feature pages inject one Facade rather than calling the store and HTTP service directly. The Facade owns coordination logic and guards against duplicate loads.

**Smart vs Dumb components** — `features/` pages inject the Facade. `shared/ui/` components accept `input()` / `output()` only — no service injection allowed.

**Mobile-first** — All base Tailwind classes target mobile (iPhone SE). Desktop layout is added with `md:` / `lg:` modifiers. Bottom Tab Bar becomes Top Navbar at `md:`. Hover interactions use `md:hover:` to avoid sticky hover on iOS.

## API Key Security

- The Bearer token lives in `environment.ts`, populated at build time from `TMDB_BEARER_TOKEN` env var — never committed to source control.
- `auth-api.interceptor.ts` attaches the token **only** to `api.themoviedb.org` requests.
- In production, add an **HTTP Referrer Restriction** in the TMDB dashboard to lock the token to your Vercel domain.

## PWA

- Service worker enabled in production via `@angular/service-worker`
- TMDB popular-movies cached 1 h (freshness), other API responses 2 h (performance)
- Web manifest: `theme_color: #e50914`, standalone display
- Install prompt banner via `beforeinstallprompt` (Chrome/Edge)

## CI / CD

Every push and PR runs:

1. **Lint** — ESLint + Prettier check
2. **Unit tests** — Vitest (33 tests)
3. **Production build** — AOT + SSR prerender with `TMDB_BEARER_TOKEN` secret

Dependabot sends weekly PRs for Angular, ngrx, and dev-tooling packages (no automatic major-version bumps).

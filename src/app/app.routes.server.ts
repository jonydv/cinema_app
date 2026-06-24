import { RenderMode, ServerRoute } from '@angular/ssr'

export const serverRoutes: ServerRoute[] = [
  // Static routes — prerendered at build time for instant first paint + SEO
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'search', renderMode: RenderMode.Prerender },
  { path: 'favorites', renderMode: RenderMode.Prerender },
  { path: '**', renderMode: RenderMode.Prerender },

  // Dynamic routes — server-rendered on demand (id only known at request time)
  { path: 'movie/:id', renderMode: RenderMode.Server },
  { path: 'person/:id', renderMode: RenderMode.Server },

  // Static pages added in Sprint 2
  { path: 'watchlist', renderMode: RenderMode.Prerender },
]

import { Routes } from '@angular/router'

import { AppShellComponent } from '@features/layout/app-shell.component'

export const routes: Routes = [
  {
    path: '',
    component: AppShellComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('@features/home/home.page').then((m) => m.HomePage),
      },
      {
        path: 'movie/:id',
        loadComponent: () => import('@features/details/details.page').then((m) => m.DetailsPage),
      },
      {
        path: 'search',
        loadComponent: () => import('@features/search/search.page').then((m) => m.SearchPage),
      },
      {
        path: 'favorites',
        loadComponent: () =>
          import('@features/favorites/favorites.page').then((m) => m.FavoritesPage),
      },
      {
        path: 'watchlist',
        loadComponent: () =>
          import('@features/watchlist/watchlist.page').then((m) => m.WatchlistPage),
      },
      {
        path: 'person/:id',
        loadComponent: () => import('@features/person/person.page').then((m) => m.PersonPage),
      },
      {
        path: 'history',
        loadComponent: () => import('@features/history/history.page').then((m) => m.HistoryPage),
      },
      {
        path: '**',
        loadComponent: () =>
          import('@features/not-found/not-found.page').then((m) => m.NotFoundPage),
      },
    ],
  },
]

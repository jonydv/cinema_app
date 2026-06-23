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
        path: '**',
        loadComponent: () =>
          import('@features/not-found/not-found.page').then((m) => m.NotFoundPage),
      },
    ],
  },
]

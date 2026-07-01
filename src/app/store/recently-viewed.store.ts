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

const STORAGE_KEY = 'recently_viewed'
const MAX_ITEMS = 20

export const RecentlyViewedStore = signalStore(
  { providedIn: 'root' },
  withState({ items: [] as Movie[] }),
  withComputed(({ items }) => ({
    recentlyViewed: computed(() => items()),
  })),
  withMethods((store) => ({
    addVisit(movie: Movie): void {
      patchState(store, (state) => ({
        items: [movie, ...state.items.filter((m) => m.id !== movie.id)].slice(0, MAX_ITEMS),
      }))
    },
  })),
  withHooks({
    onInit(store, storage = inject(LocalStorageService)) {
      const saved = storage.get<Movie[]>(STORAGE_KEY)
      if (saved?.length) {
        patchState(store, { items: saved })
      }
      effect(() => {
        storage.set(STORAGE_KEY, store.items())
      })
    },
  }),
)

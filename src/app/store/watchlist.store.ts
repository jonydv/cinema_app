import { effect, inject } from '@angular/core'
import { computed } from '@angular/core'

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

const STORAGE_KEY = 'watchlist'

export const WatchlistStore = signalStore(
  { providedIn: 'root' },
  withState({ watchlist: [] as Movie[] }),
  withComputed(({ watchlist }) => ({
    count: computed(() => watchlist().length),
  })),
  withMethods((store) => ({
    toggleWatchlist(movie: Movie): void {
      const current = store.watchlist()
      const exists = current.some((m) => m.id === movie.id)
      patchState(store, {
        watchlist: exists ? current.filter((m) => m.id !== movie.id) : [...current, movie],
      })
    },

    isInWatchlist(id: number): boolean {
      return store.watchlist().some((m) => m.id === id)
    },

    clearAll(): void {
      patchState(store, { watchlist: [] })
    },
  })),
  withHooks({
    onInit(store, storage = inject(LocalStorageService)) {
      const saved = storage.get<Movie[]>(STORAGE_KEY)
      if (saved?.length) {
        patchState(store, { watchlist: saved })
      }
      effect(() => {
        storage.set(STORAGE_KEY, store.watchlist())
      })
    },
  }),
)

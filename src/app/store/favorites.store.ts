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

const STORAGE_KEY = 'favorites'

interface FavoritesState {
  favorites: Movie[]
}

export const FavoritesStore = signalStore(
  { providedIn: 'root' },
  withState<FavoritesState>({ favorites: [] }),
  withComputed(({ favorites }) => ({
    count: computed(() => favorites().length),
  })),
  withMethods((store) => ({
    toggleFavorite(movie: Movie): void {
      const current = store.favorites()
      const exists = current.some((m) => m.id === movie.id)
      patchState(store, {
        favorites: exists ? current.filter((m) => m.id !== movie.id) : [...current, movie],
      })
    },

    isFavorite(id: number): boolean {
      return store.favorites().some((m) => m.id === id)
    },

    clearAll(): void {
      patchState(store, { favorites: [] })
    },
  })),
  withHooks({
    onInit(store, storage = inject(LocalStorageService)) {
      // Rehydrate from localStorage on startup
      const saved = storage.get<Movie[]>(STORAGE_KEY)
      if (saved?.length) {
        patchState(store, { favorites: saved })
      }

      // Persist to localStorage whenever favorites change
      effect(() => {
        storage.set(STORAGE_KEY, store.favorites())
      })
    },
  }),
)

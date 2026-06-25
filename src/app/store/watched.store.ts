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

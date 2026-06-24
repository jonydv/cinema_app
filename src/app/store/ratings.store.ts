import { effect, inject } from '@angular/core'

import { patchState, signalStore, withHooks, withMethods, withState } from '@ngrx/signals'

import { LocalStorageService } from '@core/storage/local-storage.service'

export const RatingsStore = signalStore(
  { providedIn: 'root' },
  withState({ ratings: {} as Record<number, number> }),
  withMethods((store) => ({
    setRating(movieId: number, stars: number): void {
      patchState(store, (s) => ({ ratings: { ...s.ratings, [movieId]: stars } }))
    },

    getRating(movieId: number): number {
      return store.ratings()[movieId] ?? 0
    },

    removeRating(movieId: number): void {
      patchState(store, (s) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [movieId]: _removed, ...rest } = s.ratings
        return { ratings: rest }
      })
    },
  })),
  withHooks({
    onInit(store, storage = inject(LocalStorageService)) {
      const saved = storage.get<Record<number, number>>('ratings')
      if (saved) patchState(store, { ratings: saved })
      effect(() => {
        storage.set('ratings', store.ratings())
      })
    },
  }),
)

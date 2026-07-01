import { inject } from '@angular/core'

import { EMPTY, forkJoin, of, pipe } from 'rxjs'
import { catchError, distinctUntilChanged, switchMap, tap } from 'rxjs/operators'

import { patchState, signalStore, withHooks, withMethods, withState } from '@ngrx/signals'
import { rxMethod } from '@ngrx/signals/rxjs-interop'

import { TranslocoService } from '@ngneat/transloco'

import { TmdbService } from '@data/api/tmdb.service'
import { MovieDetail, MovieReview, WatchProvider } from '@data/models/movie.model'
import {
  CallState,
  setError,
  setLoaded,
  setLoading,
  withCallState,
} from '@store/connectors/call-state.feature'

export const MovieDetailStore = signalStore(
  { providedIn: 'root' },
  withCallState(),
  withState({
    movie: null as MovieDetail | null,
    currentId: null as number | null,
    watchProviders: null as WatchProvider[] | null,
    reviews: [] as MovieReview[],
  }),
  withMethods((store, tmdbService = inject(TmdbService)) => ({
    loadMovie: rxMethod<number>(
      pipe(
        tap((id) =>
          patchState(store, setLoading(), {
            movie: null,
            watchProviders: null,
            reviews: [],
            currentId: id,
          }),
        ),
        switchMap((id) =>
          forkJoin({
            movie: tmdbService.getMovieDetails(id),
            watchProviders: tmdbService.getWatchProviders(id),
            reviews: tmdbService.getMovieReviews(id).pipe(catchError(() => of([]))),
          }).pipe(
            tap(({ movie, watchProviders, reviews }) =>
              patchState(store, { movie, watchProviders, reviews }, setLoaded()),
            ),
            catchError((err: unknown) => {
              const message = err instanceof Error ? err.message : 'Error al cargar la película.'
              patchState(store, setError(message))
              return EMPTY
            }),
          ),
        ),
      ),
    ),

    clearMovie(): void {
      patchState(store, {
        movie: null,
        currentId: null,
        watchProviders: null,
        reviews: [],
        callState: 'init' as CallState,
      })
    },
  })),
  withHooks({
    onInit(store) {
      inject(TranslocoService)
        .langChanges$.pipe(distinctUntilChanged())
        .subscribe(() => {
          const id = store.currentId()
          if (id !== null) store.loadMovie(id)
        })
    },
  }),
)

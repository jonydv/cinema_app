import { inject } from '@angular/core'

import { EMPTY, pipe } from 'rxjs'
import { catchError, switchMap, tap } from 'rxjs/operators'

import { patchState, signalStore, withMethods, withState } from '@ngrx/signals'
import { rxMethod } from '@ngrx/signals/rxjs-interop'

import { TmdbService } from '@data/api/tmdb.service'
import { MovieDetail } from '@data/models/movie.model'
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
  withState({ movie: null as MovieDetail | null }),
  withMethods((store, tmdbService = inject(TmdbService)) => ({
    loadMovie: rxMethod<number>(
      pipe(
        tap(() => patchState(store, setLoading(), { movie: null })),
        switchMap((id) =>
          tmdbService.getMovieDetails(id).pipe(
            tap((movie) => patchState(store, { movie }, setLoaded())),
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
      patchState(store, { movie: null, callState: 'init' as CallState })
    },
  })),
)

import { inject } from '@angular/core'

import { EMPTY, pipe } from 'rxjs'
import { catchError, switchMap, tap } from 'rxjs/operators'

import { patchState, signalStore, withMethods, withState } from '@ngrx/signals'
import { rxMethod } from '@ngrx/signals/rxjs-interop'

import { TmdbService } from '@data/api/tmdb.service'
import { MovieDetail } from '@data/models/movie.model'

interface MovieDetailState {
  movie: MovieDetail | null
  isLoading: boolean
  error: string | null
}

const initialState: MovieDetailState = {
  movie: null,
  isLoading: false,
  error: null,
}

export const MovieDetailStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, tmdbService = inject(TmdbService)) => ({
    loadMovie: rxMethod<number>(
      pipe(
        tap(() => patchState(store, { isLoading: true, movie: null, error: null })),
        switchMap((id) =>
          tmdbService.getMovieDetails(id).pipe(
            tap((movie) => patchState(store, { movie, isLoading: false })),
            catchError((err: unknown) => {
              const message = err instanceof Error ? err.message : 'Error al cargar la película.'
              patchState(store, { isLoading: false, error: message })
              return EMPTY
            }),
          ),
        ),
      ),
    ),

    clearMovie(): void {
      patchState(store, initialState)
    },
  })),
)

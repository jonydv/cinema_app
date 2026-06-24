import { inject } from '@angular/core'

import { EMPTY, pipe } from 'rxjs'
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter,
  switchMap,
  tap,
} from 'rxjs/operators'

import { patchState, signalStore, withMethods, withState } from '@ngrx/signals'
import { rxMethod } from '@ngrx/signals/rxjs-interop'

import { TmdbService } from '@data/api/tmdb.service'
import { Movie } from '@data/models/movie.model'
import { CallState, setError, setLoaded, withCallState } from '@store/connectors/call-state.feature'

export const SearchStore = signalStore(
  { providedIn: 'root' },
  withCallState(),
  withState({ query: '', results: [] as Movie[], totalResults: 0 }),
  withMethods((store, tmdbService = inject(TmdbService)) => ({
    search: rxMethod<string>(
      pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap((query) => {
          const callState: CallState = query ? 'loading' : 'init'
          patchState(store, { query, results: [], callState })
        }),
        filter((query) => query.trim().length > 0),
        switchMap((query) =>
          tmdbService.searchMovies(query).pipe(
            tap(({ movies, totalResults }) =>
              patchState(store, { results: movies, totalResults }, setLoaded()),
            ),
            catchError(() => {
              patchState(store, setError('Error en la búsqueda.'))
              return EMPTY
            }),
          ),
        ),
      ),
    ),

    setQuery(query: string): void {
      patchState(store, { query })
    },

    clear(): void {
      patchState(store, { query: '', results: [], totalResults: 0, callState: 'init' as CallState })
    },
  })),
)

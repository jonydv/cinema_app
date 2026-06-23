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

interface SearchState {
  query: string
  results: Movie[]
  isLoading: boolean
  totalResults: number
}

const initialState: SearchState = {
  query: '',
  results: [],
  isLoading: false,
  totalResults: 0,
}

export const SearchStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, tmdbService = inject(TmdbService)) => ({
    search: rxMethod<string>(
      pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap((query) => patchState(store, { query, isLoading: !!query, results: [] })),
        filter((query) => query.trim().length > 0),
        switchMap((query) =>
          tmdbService.searchMovies(query).pipe(
            tap(({ movies, totalResults }) =>
              patchState(store, { results: movies, totalResults, isLoading: false }),
            ),
            catchError(() => {
              patchState(store, { isLoading: false })
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
      patchState(store, initialState)
    },
  })),
)

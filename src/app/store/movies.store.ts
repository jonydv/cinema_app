import { inject } from '@angular/core'
import { computed } from '@angular/core'

import { EMPTY, pipe } from 'rxjs'
import { catchError, switchMap, tap } from 'rxjs/operators'

import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals'
import { rxMethod } from '@ngrx/signals/rxjs-interop'

import { TmdbService } from '@data/api/tmdb.service'
import { Movie } from '@data/models/movie.model'

interface MoviesState {
  movies: Movie[]
  isLoading: boolean
  currentPage: number
  totalPages: number
  activeGenre: number | null
  sortBy: string
}

const initialState: MoviesState = {
  movies: [],
  isLoading: false,
  currentPage: 1,
  totalPages: 1,
  activeGenre: null,
  sortBy: 'popularity.desc',
}

export const MoviesStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ movies, currentPage, totalPages }) => ({
    hasMore: computed(() => currentPage() < totalPages()),
    moviesCount: computed(() => movies().length),
  })),
  withMethods((store, tmdbService = inject(TmdbService)) => ({
    loadMovies: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true, movies: [], currentPage: 1 })),
        switchMap(() =>
          tmdbService.getPopularMovies(1).pipe(
            tap(({ movies, totalPages }) =>
              patchState(store, { movies, totalPages, currentPage: 1, isLoading: false }),
            ),
            catchError(() => {
              patchState(store, { isLoading: false })
              return EMPTY
            }),
          ),
        ),
      ),
    ),

    loadMore: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(() => {
          const nextPage = store.currentPage() + 1
          return tmdbService.getPopularMovies(nextPage).pipe(
            tap(({ movies, totalPages }) =>
              patchState(store, (state) => ({
                movies: [...state.movies, ...movies],
                totalPages,
                currentPage: nextPage,
                isLoading: false,
              })),
            ),
            catchError(() => {
              patchState(store, { isLoading: false })
              return EMPTY
            }),
          )
        }),
      ),
    ),

    setGenre(id: number | null): void {
      patchState(store, { activeGenre: id })
    },

    setSortBy(sort: string): void {
      patchState(store, { sortBy: sort })
    },
  })),
)

import { computed, inject } from '@angular/core'

import { EMPTY, Observable, pipe } from 'rxjs'
import { catchError, switchMap, tap } from 'rxjs/operators'

import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals'
import { addEntities, setAllEntities } from '@ngrx/signals/entities'
import { rxMethod } from '@ngrx/signals/rxjs-interop'

import { TmdbService } from '@data/api/tmdb.service'
import { Movie, PagedMovies } from '@data/models/movie.model'
import { setError, setLoaded, setLoading } from '@store/connectors/call-state.feature'
import { withTmdbList } from '@store/connectors/tmdb-list.feature'

export const MoviesStore = signalStore(
  { providedIn: 'root' },
  withTmdbList<Movie>(),
  withState({ activeGenre: null as number | null, sortBy: 'popularity.desc' }),
  withComputed(({ entities }) => ({
    movies: computed(() => entities()),
  })),
  withMethods((store, tmdbService = inject(TmdbService)) => {
    const fetchPage = (page: number): Observable<PagedMovies> => {
      const genre = store.activeGenre()
      const sort = store.sortBy()
      if (genre !== null || sort !== 'popularity.desc') {
        return tmdbService.getDiscoverMovies(page, genre, sort)
      }
      return tmdbService.getPopularMovies(page)
    }

    return {
      loadMovies: rxMethod<void>(
        pipe(
          tap(() =>
            patchState(store, setLoading(), setAllEntities([] as Movie[]), { currentPage: 1 }),
          ),
          switchMap(() =>
            fetchPage(1).pipe(
              tap(({ movies, totalPages }) =>
                patchState(
                  store,
                  setAllEntities(movies),
                  { totalPages, currentPage: 1 },
                  setLoaded(),
                ),
              ),
              catchError((e) => {
                patchState(store, setError(String(e)))
                return EMPTY
              }),
            ),
          ),
        ),
      ),

      loadMore: rxMethod<void>(
        pipe(
          switchMap(() => {
            const nextPage = store.currentPage() + 1
            return fetchPage(nextPage).pipe(
              tap(({ movies, totalPages }) =>
                patchState(store, addEntities(movies), { totalPages, currentPage: nextPage }),
              ),
              catchError(() => EMPTY),
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
    }
  }),
)

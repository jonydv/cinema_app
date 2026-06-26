import { computed, inject } from '@angular/core'

import { EMPTY, Observable, pipe } from 'rxjs'
import { catchError, distinctUntilChanged, switchMap, tap } from 'rxjs/operators'

import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals'
import { addEntities, setAllEntities } from '@ngrx/signals/entities'
import { rxMethod } from '@ngrx/signals/rxjs-interop'

import { TranslocoService } from '@ngneat/transloco'

import { TmdbService } from '@data/api/tmdb.service'
import { Movie, PagedMovies } from '@data/models/movie.model'
import { setError, setLoaded, setLoading } from '@store/connectors/call-state.feature'
import { withTmdbList } from '@store/connectors/tmdb-list.feature'

export const MoviesStore = signalStore(
  { providedIn: 'root' },
  withTmdbList<Movie>(),
  withState({
    activeGenre: null as number | null,
    sortBy: 'popularity.desc',
    yearFrom: null as number | null,
    yearTo: null as number | null,
    minRating: 0,
    minRuntime: null as number | null,
    maxRuntime: null as number | null,
  }),
  withComputed(({ entities }) => ({
    movies: computed(() => entities()),
  })),
  withMethods((store, tmdbService = inject(TmdbService)) => {
    const isFiltered = (): boolean =>
      store.activeGenre() !== null ||
      store.sortBy() !== 'popularity.desc' ||
      store.yearFrom() !== null ||
      store.yearTo() !== null ||
      store.minRating() > 0 ||
      store.minRuntime() !== null ||
      store.maxRuntime() !== null

    const fetchPage = (page: number): Observable<PagedMovies> => {
      if (isFiltered()) {
        return tmdbService.getDiscoverMovies(
          page,
          store.activeGenre(),
          store.sortBy(),
          store.yearFrom(),
          store.yearTo(),
          store.minRating(),
          store.minRuntime(),
          store.maxRuntime(),
        )
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

      setYearRange(from: number | null, to: number | null): void {
        patchState(store, { yearFrom: from, yearTo: to })
      },

      setMinRating(rating: number): void {
        patchState(store, { minRating: rating })
      },

      setRuntimeRange(min: number | null, max: number | null): void {
        patchState(store, { minRuntime: min, maxRuntime: max })
      },
    }
  }),
  withHooks({
    onInit(store) {
      inject(TranslocoService)
        .langChanges$.pipe(distinctUntilChanged())
        .subscribe(() => store.loadMovies())
    },
  }),
)

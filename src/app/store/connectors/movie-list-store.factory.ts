import { inject } from '@angular/core'

import { EMPTY, Observable, pipe } from 'rxjs'
import { catchError, distinctUntilChanged, switchMap, tap } from 'rxjs/operators'

import { patchState, signalStore, withHooks, withMethods } from '@ngrx/signals'
import { setAllEntities } from '@ngrx/signals/entities'
import { rxMethod } from '@ngrx/signals/rxjs-interop'

import { TranslocoService } from '@ngneat/transloco'

import { TmdbService } from '@data/api/tmdb.service'
import { Movie, PagedMovies } from '@data/models/movie.model'
import { setError, setLoaded, setLoading } from '@store/connectors/call-state.feature'
import { withTmdbList } from '@store/connectors/tmdb-list.feature'

export function createMovieListStore(
  fetchFn: (tmdb: TmdbService) => Observable<PagedMovies>,
  errorKey: string,
) {
  return signalStore(
    { providedIn: 'root' },
    withTmdbList<Movie>(),
    withMethods((store, tmdb = inject(TmdbService)) => ({
      load: rxMethod<void>(
        pipe(
          tap(() =>
            patchState(store, setLoading(), setAllEntities([] as Movie[]), { currentPage: 1 }),
          ),
          switchMap(() =>
            fetchFn(tmdb).pipe(
              tap(({ movies, totalPages }) =>
                patchState(
                  store,
                  setAllEntities(movies),
                  { totalPages, currentPage: 1 },
                  setLoaded(),
                ),
              ),
              catchError(() => {
                patchState(store, setError(errorKey))
                return EMPTY
              }),
            ),
          ),
        ),
      ),
    })),
    withHooks({
      onInit(store) {
        store.load()
        inject(TranslocoService)
          .langChanges$.pipe(distinctUntilChanged())
          .subscribe(() => store.load())
      },
    }),
  )
}

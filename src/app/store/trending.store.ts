import { inject } from '@angular/core'

import { EMPTY, pipe } from 'rxjs'
import { catchError, switchMap, tap } from 'rxjs/operators'

import { patchState, signalStore, withMethods } from '@ngrx/signals'
import { addEntities, setAllEntities } from '@ngrx/signals/entities'
import { rxMethod } from '@ngrx/signals/rxjs-interop'

import { TmdbService } from '@data/api/tmdb.service'
import { Movie } from '@data/models/movie.model'
import { setError, setLoaded, setLoading } from '@store/connectors/call-state.feature'
import { withTmdbList } from '@store/connectors/tmdb-list.feature'

export const TrendingStore = signalStore(
  { providedIn: 'root' },
  withTmdbList<Movie>(),
  withMethods((store, tmdb = inject(TmdbService)) => ({
    load: rxMethod<void>(
      pipe(
        tap(() =>
          patchState(store, setLoading(), setAllEntities([] as Movie[]), { currentPage: 1 }),
        ),
        switchMap(() =>
          tmdb.getTrending(1).pipe(
            tap(({ movies, totalPages }) =>
              patchState(
                store,
                setAllEntities(movies),
                { totalPages, currentPage: 1 },
                setLoaded(),
              ),
            ),
            catchError(() => {
              patchState(store, setError('Error al cargar tendencias.'))
              return EMPTY
            }),
          ),
        ),
      ),
    ),

    loadMore: rxMethod<void>(
      pipe(
        switchMap(() => {
          const next = store.currentPage() + 1
          return tmdb.getTrending(next).pipe(
            tap(({ movies, totalPages }) =>
              patchState(store, addEntities(movies), { totalPages, currentPage: next }),
            ),
            catchError(() => EMPTY),
          )
        }),
      ),
    ),
  })),
)

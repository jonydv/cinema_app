import { inject } from '@angular/core'

import { EMPTY, pipe } from 'rxjs'
import { catchError, switchMap, tap } from 'rxjs/operators'

import { patchState, signalStore, withMethods } from '@ngrx/signals'
import { setAllEntities } from '@ngrx/signals/entities'
import { rxMethod } from '@ngrx/signals/rxjs-interop'

import { TmdbService } from '@data/api/tmdb.service'
import { Movie } from '@data/models/movie.model'
import { CallState, setError, setLoaded, setLoading } from '@store/connectors/call-state.feature'
import { withTmdbList } from '@store/connectors/tmdb-list.feature'

export const RecommendationsStore = signalStore(
  { providedIn: 'root' },
  withTmdbList<Movie>(),
  withMethods((store, tmdb = inject(TmdbService)) => ({
    load: rxMethod<number>(
      pipe(
        tap(() =>
          patchState(store, setLoading(), setAllEntities([] as Movie[]), { currentPage: 1 }),
        ),
        switchMap((movieId) =>
          tmdb.getRecommendations(movieId, 1).pipe(
            tap(({ movies, totalPages }) =>
              patchState(
                store,
                setAllEntities(movies),
                { totalPages, currentPage: 1 },
                setLoaded(),
              ),
            ),
            catchError(() => {
              patchState(store, setError(''))
              return EMPTY
            }),
          ),
        ),
      ),
    ),

    clear(): void {
      patchState(store, setAllEntities([] as Movie[]), {
        currentPage: 1,
        totalPages: 1,
        callState: 'init' as CallState,
      })
    },
  })),
)

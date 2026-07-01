import { inject } from '@angular/core'

import { EMPTY, pipe } from 'rxjs'
import { catchError, distinctUntilChanged, switchMap, tap } from 'rxjs/operators'

import { patchState, signalStore, withHooks, withMethods, withState } from '@ngrx/signals'
import { setAllEntities } from '@ngrx/signals/entities'
import { rxMethod } from '@ngrx/signals/rxjs-interop'

import { TranslocoService } from '@ngneat/transloco'

import { TmdbService } from '@data/api/tmdb.service'
import { Movie } from '@data/models/movie.model'
import { CallState, setError, setLoaded, setLoading } from '@store/connectors/call-state.feature'
import { withTmdbList } from '@store/connectors/tmdb-list.feature'

export const RecommendationsStore = signalStore(
  { providedIn: 'root' },
  withTmdbList<Movie>(),
  withState({ currentMovieId: null as number | null }),
  withMethods((store, tmdb = inject(TmdbService)) => ({
    load: rxMethod<number>(
      pipe(
        tap((movieId) =>
          patchState(store, setLoading(), setAllEntities([] as Movie[]), {
            currentPage: 1,
            currentMovieId: movieId,
          }),
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
              patchState(store, setError('recommendations_load_failed'))
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
        currentMovieId: null,
        callState: 'init' as CallState,
      })
    },
  })),
  withHooks({
    onInit(store) {
      inject(TranslocoService)
        .langChanges$.pipe(distinctUntilChanged())
        .subscribe(() => {
          const id = store.currentMovieId()
          if (id !== null) store.load(id)
        })
    },
  }),
)

import { inject } from '@angular/core'

import { EMPTY, pipe } from 'rxjs'
import { catchError, switchMap, tap } from 'rxjs/operators'

import { patchState, signalStore, withMethods, withState } from '@ngrx/signals'
import { rxMethod } from '@ngrx/signals/rxjs-interop'

import { TmdbService } from '@data/api/tmdb.service'
import { PersonDetail } from '@data/models/movie.model'
import {
  CallState,
  setError,
  setLoaded,
  setLoading,
  withCallState,
} from '@store/connectors/call-state.feature'

export const PersonStore = signalStore(
  { providedIn: 'root' },
  withCallState(),
  withState({ person: null as PersonDetail | null }),
  withMethods((store, tmdb = inject(TmdbService)) => ({
    loadPerson: rxMethod<number>(
      pipe(
        tap(() => patchState(store, setLoading(), { person: null })),
        switchMap((id) =>
          tmdb.getPersonDetails(id).pipe(
            tap((person) => patchState(store, { person }, setLoaded())),
            catchError((err: unknown) => {
              const message = err instanceof Error ? err.message : 'Error al cargar el actor.'
              patchState(store, setError(message))
              return EMPTY
            }),
          ),
        ),
      ),
    ),

    clearPerson(): void {
      patchState(store, { person: null, callState: 'init' as CallState })
    },
  })),
)

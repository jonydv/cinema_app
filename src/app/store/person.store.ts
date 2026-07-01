import { inject } from '@angular/core'

import { EMPTY, pipe } from 'rxjs'
import { catchError, distinctUntilChanged, switchMap, tap } from 'rxjs/operators'

import { patchState, signalStore, withHooks, withMethods, withState } from '@ngrx/signals'
import { rxMethod } from '@ngrx/signals/rxjs-interop'

import { TranslocoService } from '@ngneat/transloco'

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
  withState({ person: null as PersonDetail | null, currentPersonId: null as number | null }),
  withMethods((store, tmdb = inject(TmdbService)) => ({
    loadPerson: rxMethod<number>(
      pipe(
        tap((id) => patchState(store, setLoading(), { person: null, currentPersonId: id })),
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
      patchState(store, { person: null, currentPersonId: null, callState: 'init' as CallState })
    },
  })),
  withHooks({
    onInit(store) {
      inject(TranslocoService)
        .langChanges$.pipe(distinctUntilChanged())
        .subscribe(() => {
          const id = store.currentPersonId()
          if (id !== null) store.loadPerson(id)
        })
    },
  }),
)

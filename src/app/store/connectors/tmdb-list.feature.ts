import { computed } from '@angular/core'

import { signalStoreFeature, withComputed, withState } from '@ngrx/signals'
import { EntityId, withEntities } from '@ngrx/signals/entities'

import { CallState } from './call-state.feature'

export function withTmdbList<T extends { id: EntityId }>() {
  return signalStoreFeature(
    withEntities<T>(),
    withState({ currentPage: 1, totalPages: 1, callState: 'init' as CallState }),
    withComputed(({ currentPage, totalPages, callState }) => ({
      hasMore: computed(() => currentPage() < totalPages()),
      isLoading: computed(() => callState() === 'loading'),
      isLoaded: computed(() => callState() === 'loaded'),
      error: computed(() => {
        const s = callState()
        return typeof s === 'object' ? s.error : null
      }),
    })),
  )
}

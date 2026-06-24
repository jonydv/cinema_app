import { computed } from '@angular/core'

import { signalStoreFeature, withComputed, withState } from '@ngrx/signals'

export type CallState = 'init' | 'loading' | 'loaded' | { error: string }

export const setLoading = (): { callState: CallState } => ({ callState: 'loading' })
export const setLoaded = (): { callState: CallState } => ({ callState: 'loaded' })
export const setError = (message: string): { callState: CallState } => ({
  callState: { error: message },
})

export function withCallState() {
  return signalStoreFeature(
    withState({ callState: 'init' as CallState }),
    withComputed(({ callState }) => ({
      isLoading: computed(() => callState() === 'loading'),
      isLoaded: computed(() => callState() === 'loaded'),
      error: computed(() => {
        const s = callState()
        return typeof s === 'object' ? s.error : null
      }),
    })),
  )
}

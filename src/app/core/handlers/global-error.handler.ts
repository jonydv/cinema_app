import { ErrorHandler, Injectable } from '@angular/core'

/**
 * Catches uncaught JS runtime errors (not HTTP errors — those are handled by error.interceptor).
 * In production this would ship the error to Sentry or a similar service.
 */
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: unknown): void {
    const message = error instanceof Error ? error.message : String(error)
    const stack = error instanceof Error ? error.stack : undefined

    console.error('[GlobalErrorHandler]', { message, stack, raw: error })

    // TODO (Phase 16): pipe to Sentry in production via environment flag
  }
}

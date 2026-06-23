import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http'
import { timer } from 'rxjs'
import { retry } from 'rxjs/operators'

const MAX_RETRIES = 2
const BACKOFF_BASE_MS = 1000

/**
 * Retries failed requests up to MAX_RETRIES times with exponential backoff.
 * Only retries on 5xx server errors and network failures (status 0).
 * Never retries 4xx client errors — those are not transient.
 */
export const retryInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    retry({
      count: MAX_RETRIES,
      delay: (error: unknown, attempt: number) => {
        const isRetryable =
          error instanceof HttpErrorResponse && (error.status === 0 || error.status >= 500)

        if (!isRetryable) {
          throw error
        }

        // Exponential backoff: 1s, 2s
        return timer(BACKOFF_BASE_MS * Math.pow(2, attempt - 1))
      },
    }),
  )
}

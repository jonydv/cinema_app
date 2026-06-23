import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http'
import { ApplicationConfig, ErrorHandler, provideBrowserGlobalErrorListeners } from '@angular/core'
import { provideClientHydration, withEventReplay } from '@angular/platform-browser'
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router'
import { GlobalErrorHandler } from '@core/handlers/global-error.handler'
import { authApiInterceptor } from '@core/interceptors/auth-api.interceptor'
import { errorInterceptor } from '@core/interceptors/error.interceptor'
import { retryInterceptor } from '@core/interceptors/retry.interceptor'

import { routes } from './app.routes'

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding(), withViewTransitions()),
    provideClientHydration(withEventReplay()),
    provideHttpClient(
      withFetch(),
      // Order matters: retry fires first, then error notification on final failure
      withInterceptors([authApiInterceptor, retryInterceptor, errorInterceptor]),
    ),
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
  ],
}

import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http'
import {
  ApplicationConfig,
  ErrorHandler,
  isDevMode,
  provideBrowserGlobalErrorListeners,
} from '@angular/core'
import { provideClientHydration, withEventReplay } from '@angular/platform-browser'
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router'
import { provideServiceWorker } from '@angular/service-worker'

import { provideTransloco } from '@ngneat/transloco'

import { GlobalErrorHandler } from '@core/handlers/global-error.handler'
import { TranslocoHttpLoader } from '@core/i18n/transloco-http-loader'
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
      withInterceptors([authApiInterceptor, retryInterceptor, errorInterceptor]),
    ),
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    provideTransloco({
      config: {
        availableLangs: ['es', 'en'],
        defaultLang: 'es',
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
      },
      loader: TranslocoHttpLoader,
    }),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
}

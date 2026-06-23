import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http'
import { inject } from '@angular/core'
import { ToastService } from '@core/notifications/toast.service'
import { throwError } from 'rxjs'
import { catchError } from 'rxjs/operators'

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService)

  return next(req).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse) {
        const message = resolveErrorMessage(err)
        toast.error(message)
      } else {
        toast.error('Error inesperado. Inténtalo de nuevo.')
      }
      return throwError(() => err)
    }),
  )
}

function resolveErrorMessage(err: HttpErrorResponse): string {
  if (err.status === 0) return 'Sin conexión a internet.'
  if (err.status === 401) return 'Sesión expirada. Vuelve a iniciar sesión.'
  if (err.status === 404) return 'Contenido no encontrado.'
  if (err.status >= 500) return 'Error del servidor. Inténtalo más tarde.'
  return 'Algo salió mal. Inténtalo de nuevo.'
}

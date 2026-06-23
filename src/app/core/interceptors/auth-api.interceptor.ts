import { HttpInterceptorFn } from '@angular/common/http'
import { environment } from '@env/environment'

/**
 * Injects the TMDB Bearer token ONLY for requests targeting api.themoviedb.org.
 * This prevents the API key from leaking to analytics or any other third-party domain.
 */
export const authApiInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.includes('api.themoviedb.org')) {
    return next(req)
  }

  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${environment.tmdbBearerToken}`,
    },
  })

  return next(authReq)
}

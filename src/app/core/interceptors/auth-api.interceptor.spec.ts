import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http'
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'

import { authApiInterceptor } from './auth-api.interceptor'

describe('authApiInterceptor', () => {
  let http: HttpClient
  let controller: HttpTestingController

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authApiInterceptor])),
        provideHttpClientTesting(),
      ],
    })
    http = TestBed.inject(HttpClient)
    controller = TestBed.inject(HttpTestingController)
  })

  afterEach(() => {
    controller.verify()
    TestBed.resetTestingModule()
  })

  it('adds Authorization header for api.themoviedb.org requests', () => {
    http.get('https://api.themoviedb.org/3/movie/popular').subscribe()

    const req = controller.expectOne('https://api.themoviedb.org/3/movie/popular')
    expect(req.request.headers.has('Authorization')).toBe(true)
    expect(req.request.headers.get('Authorization')).toMatch(/^Bearer /)
    req.flush([])
  })

  it('does not add Authorization header for other domains', () => {
    http.get('https://example.com/api/data').subscribe()

    const req = controller.expectOne('https://example.com/api/data')
    expect(req.request.headers.has('Authorization')).toBe(false)
    req.flush([])
  })

  it('passes non-TMDB requests unmodified', () => {
    const original = 'https://analytics.example.com/event'
    http.get(original).subscribe()

    const req = controller.expectOne(original)
    expect(req.request.url).toBe(original)
    req.flush({})
  })
})

import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing'

import { TranslocoService } from '@ngneat/transloco'

import { TmdbService } from './tmdb.service'

describe('TmdbService — new endpoints', () => {
  let service: TmdbService
  let http: HttpTestingController
  const translocoSpy = { getActiveLang: () => 'es', langChanges$: { subscribe: () => ({}) } }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TmdbService, { provide: TranslocoService, useValue: translocoSpy }],
    })
    service = TestBed.inject(TmdbService)
    http = TestBed.inject(HttpTestingController)
  })

  afterEach(() => {
    http.verify()
    TestBed.resetTestingModule()
  })

  const flush = (url: string, body: object) =>
    http.expectOne((r) => r.url.includes(url)).flush(body)

  const emptyPaged = { results: [], total_pages: 1, total_results: 0 }

  it('getNowPlaying calls /movie/now_playing and maps results', () => {
    let result: { movies: unknown[]; totalPages: number } | undefined
    service.getNowPlaying().subscribe((r) => (result = r))

    flush('/movie/now_playing', {
      results: [
        {
          id: 1,
          title: 'A',
          poster_path: '/a.jpg',
          backdrop_path: '/b.jpg',
          vote_average: 7,
          vote_count: 100,
          release_date: '2024-01-01',
          genre_ids: [],
          overview: '',
          popularity: 100,
        },
      ],
      total_pages: 3,
      total_results: 60,
    })

    expect(result?.movies).toHaveLength(1)
    expect(result?.totalPages).toBe(3)
  })

  it('getTopRated calls /movie/top_rated', () => {
    service.getTopRated().subscribe()
    flush('/movie/top_rated', emptyPaged)
  })

  it('getUpcoming calls /movie/upcoming', () => {
    service.getUpcoming().subscribe()
    flush('/movie/upcoming', emptyPaged)
  })

  it('getGenres calls /genre/movie/list and returns genre array', () => {
    let genres: { id: number; name: string }[] | undefined
    service.getGenres().subscribe((g) => (genres = g))

    flush('/genre/movie/list', {
      genres: [
        { id: 28, name: 'Action' },
        { id: 35, name: 'Comedy' },
      ],
    })

    expect(genres).toHaveLength(2)
    expect(genres![0]).toEqual({ id: 28, name: 'Action' })
  })

  it('getDiscoverMovies passes year as primary_release_year when provided', () => {
    service.getDiscoverMovies(1, null, 'popularity.desc', 2022).subscribe()
    const req = http.expectOne((r) => r.url.includes('/discover/movie'))
    expect(req.request.params.get('primary_release_year')).toBe('2022')
    req.flush(emptyPaged)
  })

  it('getDiscoverMovies omits primary_release_year when null', () => {
    service.getDiscoverMovies(1, null, 'popularity.desc', null).subscribe()
    const req = http.expectOne((r) => r.url.includes('/discover/movie'))
    expect(req.request.params.has('primary_release_year')).toBe(false)
    req.flush(emptyPaged)
  })

  it('getDiscoverMovies passes vote_average.gte when minRating > 0', () => {
    service.getDiscoverMovies(1, null, 'popularity.desc', null, 7).subscribe()
    const req = http.expectOne((r) => r.url.includes('/discover/movie'))
    expect(req.request.params.get('vote_average.gte')).toBe('7')
    expect(req.request.params.get('vote_count.gte')).toBe('100')
    req.flush(emptyPaged)
  })

  it('getDiscoverMovies passes runtime params when provided', () => {
    service.getDiscoverMovies(1, null, 'popularity.desc', null, 0, 90, 150).subscribe()
    const req = http.expectOne((r) => r.url.includes('/discover/movie'))
    expect(req.request.params.get('with_runtime.gte')).toBe('90')
    expect(req.request.params.get('with_runtime.lte')).toBe('150')
    req.flush(emptyPaged)
  })
})

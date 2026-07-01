import type {
  TmdbCastMemberDto,
  TmdbMovieDetailDto,
  TmdbMovieDto,
  TmdbVideoDto,
} from '../dtos/tmdb-movie.dto'

import { adaptActor, adaptMovie, adaptMovieDetail } from './movie.adapter'

const mockMovieDto: TmdbMovieDto = {
  id: 123,
  title: 'Test Movie',
  overview: 'An overview',
  poster_path: '/test.jpg',
  backdrop_path: '/backdrop.jpg',
  vote_average: 7.654,
  vote_count: 1234,
  release_date: '2024-01-15',
  genre_ids: [28, 12],
  popularity: 200.5,
  adult: false,
  original_language: 'en',
  original_title: 'Test Movie',
  video: false,
}

const mockActorDto: TmdbCastMemberDto = {
  id: 1,
  name: 'Jane Doe',
  character: 'Hero',
  profile_path: '/profile.jpg',
  order: 0,
  known_for_department: 'Acting',
}

describe('adaptMovie', () => {
  it('maps id, title and overview', () => {
    const movie = adaptMovie(mockMovieDto)
    expect(movie.id).toBe(123)
    expect(movie.title).toBe('Test Movie')
    expect(movie.overview).toBe('An overview')
  })

  it('constructs posterUrl from poster_path', () => {
    const movie = adaptMovie(mockMovieDto)
    expect(movie.posterUrl).toBe('https://image.tmdb.org/t/p/w500/test.jpg')
  })

  it('uses fallback posterUrl when poster_path is null', () => {
    const movie = adaptMovie({ ...mockMovieDto, poster_path: null })
    expect(movie.posterUrl).toBe('/assets/images/no-poster.svg')
  })

  it('constructs backdropUrl from backdrop_path', () => {
    const movie = adaptMovie(mockMovieDto)
    expect(movie.backdropUrl).toBe('https://image.tmdb.org/t/p/original/backdrop.jpg')
  })

  it('rounds rating to one decimal place', () => {
    const movie = adaptMovie(mockMovieDto)
    expect(movie.rating).toBe(7.7)
  })

  it('extracts releaseYear from release_date', () => {
    const movie = adaptMovie(mockMovieDto)
    expect(movie.releaseYear).toBe(2024)
  })

  it('sets releaseYear to 0 when release_date is empty', () => {
    const movie = adaptMovie({ ...mockMovieDto, release_date: '' })
    expect(movie.releaseYear).toBe(0)
  })

  it('copies genre_ids to genreIds', () => {
    const movie = adaptMovie(mockMovieDto)
    expect(movie.genreIds).toEqual([28, 12])
  })
})

describe('adaptActor', () => {
  it('maps id, name and character', () => {
    const actor = adaptActor(mockActorDto)
    expect(actor.id).toBe(1)
    expect(actor.name).toBe('Jane Doe')
    expect(actor.character).toBe('Hero')
  })

  it('constructs profileUrl from profile_path', () => {
    const actor = adaptActor(mockActorDto)
    expect(actor.profileUrl).toBe('https://image.tmdb.org/t/p/w185/profile.jpg')
  })

  it('returns null profileUrl when profile_path is null', () => {
    const actor = adaptActor({ ...mockActorDto, profile_path: null })
    expect(actor.profileUrl).toBeNull()
  })
})

describe('adaptMovieDetail', () => {
  const detailDto: TmdbMovieDetailDto = {
    ...mockMovieDto,
    runtime: 120,
    genres: [{ id: 28, name: 'Action' }],
    tagline: 'An epic tale',
    status: 'Released',
    budget: 0,
    revenue: 0,
    homepage: null,
  }

  const officialTrailer: TmdbVideoDto = {
    id: 'v1',
    key: 'abc123',
    name: 'Official Trailer',
    site: 'YouTube',
    type: 'Trailer',
    official: true,
  }

  it('maps basic movie fields', () => {
    const detail = adaptMovieDetail(detailDto, [officialTrailer], [mockActorDto])
    expect(detail.id).toBe(123)
    expect(detail.title).toBe('Test Movie')
    expect(detail.runtime).toBe(120)
    expect(detail.tagline).toBe('An epic tale')
  })

  it('maps genres to name array', () => {
    const detail = adaptMovieDetail(detailDto, [], [])
    expect(detail.genres).toEqual(['Action'])
  })

  it('picks official YouTube trailer as trailerKey', () => {
    const detail = adaptMovieDetail(detailDto, [officialTrailer], [])
    expect(detail.trailerKey).toBe('abc123')
  })

  it('returns null trailerKey when no videos', () => {
    const detail = adaptMovieDetail(detailDto, [], [])
    expect(detail.trailerKey).toBeNull()
  })

  it('slices cast to max 15 members', () => {
    const manyCast = Array.from({ length: 20 }, (_, i) => ({ ...mockActorDto, id: i + 1 }))
    const detail = adaptMovieDetail(detailDto, [], manyCast)
    expect(detail.cast).toHaveLength(15)
  })
})

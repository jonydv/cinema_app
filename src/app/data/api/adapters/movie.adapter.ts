import {
  TmdbCastMemberDto,
  TmdbMovieDetailDto,
  TmdbMovieDto,
  TmdbVideoDto,
} from '@data/api/dtos/tmdb-movie.dto'
import { Actor, Movie, MovieDetail } from '@data/models/movie.model'

const BASE_IMG = 'https://image.tmdb.org/t/p'
const FALLBACK_POSTER = '/assets/images/no-poster.svg'
const FALLBACK_BACKDROP = ''

export const adaptMovie = (dto: TmdbMovieDto): Movie => ({
  id: dto.id,
  title: dto.title,
  overview: dto.overview,
  posterUrl: dto.poster_path ? `${BASE_IMG}/w500${dto.poster_path}` : FALLBACK_POSTER,
  backdropUrl: dto.backdrop_path ? `${BASE_IMG}/original${dto.backdrop_path}` : FALLBACK_BACKDROP,
  rating: Math.round(dto.vote_average * 10) / 10,
  voteCount: dto.vote_count,
  releaseDate: dto.release_date,
  releaseYear: dto.release_date ? new Date(dto.release_date).getFullYear() : 0,
  genreIds: dto.genre_ids,
  popularity: dto.popularity,
})

export const adaptActor = (dto: TmdbCastMemberDto): Actor => ({
  id: dto.id,
  name: dto.name,
  character: dto.character,
  profileUrl: dto.profile_path
    ? `${BASE_IMG}/w185${dto.profile_path}`
    : '/assets/images/no-profile.svg',
})

export const adaptMovieDetail = (
  dto: TmdbMovieDetailDto,
  videos: TmdbVideoDto[],
  cast: TmdbCastMemberDto[],
): MovieDetail => ({
  id: dto.id,
  title: dto.title,
  overview: dto.overview,
  posterUrl: dto.poster_path ? `${BASE_IMG}/w500${dto.poster_path}` : FALLBACK_POSTER,
  backdropUrl: dto.backdrop_path ? `${BASE_IMG}/original${dto.backdrop_path}` : FALLBACK_BACKDROP,
  rating: Math.round(dto.vote_average * 10) / 10,
  voteCount: dto.vote_count,
  releaseDate: dto.release_date,
  releaseYear: dto.release_date ? new Date(dto.release_date).getFullYear() : 0,
  genreIds: dto.genres.map((g) => g.id),
  popularity: dto.popularity,
  runtime: dto.runtime ?? 0,
  genres: dto.genres.map((g) => g.name),
  tagline: dto.tagline,
  trailerKey: resolveTrailerKey(videos),
  cast: cast.slice(0, 15).map(adaptActor),
})

function resolveTrailerKey(videos: TmdbVideoDto[]): string | null {
  const trailer = videos.find((v) => v.site === 'YouTube' && v.type === 'Trailer' && v.official)
  return trailer?.key ?? videos.find((v) => v.site === 'YouTube')?.key ?? null
}

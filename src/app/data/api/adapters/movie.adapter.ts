import {
  TmdbCastMemberDto,
  TmdbMovieDetailDto,
  TmdbMovieDto,
  TmdbPersonDto,
  TmdbPersonMovieCreditDto,
  TmdbVideoDto,
  TmdbWatchProvidersResponseDto,
} from '@data/api/dtos/tmdb-movie.dto'
import { Actor, Movie, MovieDetail, PersonDetail, WatchProvider } from '@data/models/movie.model'

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

export const adaptWatchProviders = (
  dto: TmdbWatchProvidersResponseDto,
  countryCode = 'US',
): WatchProvider[] => {
  const country = dto.results[countryCode] ?? dto.results['US']
  if (!country) return []
  const all = [...(country.flatrate ?? []), ...(country.rent ?? []), ...(country.buy ?? [])]
  return Array.from(new Map(all.map((p) => [p.provider_id, p])).values()).map((p) => ({
    id: p.provider_id,
    name: p.provider_name,
    logoUrl: `${BASE_IMG}/w45${p.logo_path}`,
  }))
}

export const adaptPerson = (
  dto: TmdbPersonDto,
  credits: TmdbPersonMovieCreditDto[],
): PersonDetail => ({
  id: dto.id,
  name: dto.name,
  biography: dto.biography,
  birthday: dto.birthday,
  birthplace: dto.place_of_birth,
  profileUrl: dto.profile_path
    ? `${BASE_IMG}/w342${dto.profile_path}`
    : '/assets/images/no-profile.svg',
  knownFor: dto.known_for_department,
  credits: credits
    .filter((c) => c.poster_path)
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 20)
    .map((c) => adaptMovie(c)),
})

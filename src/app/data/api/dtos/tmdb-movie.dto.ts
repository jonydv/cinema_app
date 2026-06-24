/** Raw response shape from TMDB API — snake_case as the API returns it. */
export interface TmdbMovieDto {
  id: number
  title: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  vote_average: number
  vote_count: number
  release_date: string
  genre_ids: number[]
  popularity: number
  adult: boolean
  original_language: string
  original_title: string
  video: boolean
}

export interface TmdbGenreDto {
  id: number
  name: string
}

export interface TmdbMovieDetailDto extends Omit<TmdbMovieDto, 'genre_ids'> {
  runtime: number | null
  genres: TmdbGenreDto[]
  tagline: string
  status: string
  budget: number
  revenue: number
  homepage: string | null
}

export interface TmdbCastMemberDto {
  id: number
  name: string
  character: string
  profile_path: string | null
  order: number
  known_for_department: string
}

export interface TmdbCreditsDto {
  id: number
  cast: TmdbCastMemberDto[]
}

export interface TmdbVideoDto {
  id: string
  key: string
  name: string
  site: string
  type: string
  official: boolean
}

export interface TmdbVideosDto {
  id: number
  results: TmdbVideoDto[]
}

export interface TmdbPagedResponseDto<T> {
  page: number
  results: T[]
  total_pages: number
  total_results: number
}

// ── Watch Providers ───────────────────────────────────────────────────────────

export interface TmdbWatchProviderItemDto {
  provider_id: number
  provider_name: string
  logo_path: string
}

export interface TmdbWatchProviderCountryDto {
  link?: string
  flatrate?: TmdbWatchProviderItemDto[]
  rent?: TmdbWatchProviderItemDto[]
  buy?: TmdbWatchProviderItemDto[]
}

export interface TmdbWatchProvidersResponseDto {
  id: number
  results: Record<string, TmdbWatchProviderCountryDto>
}

// ── Person ────────────────────────────────────────────────────────────────────

export interface TmdbPersonDto {
  id: number
  name: string
  biography: string
  birthday: string | null
  deathday: string | null
  place_of_birth: string | null
  profile_path: string | null
  known_for_department: string
  popularity: number
}

export interface TmdbPersonMovieCreditDto {
  id: number
  title: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  vote_average: number
  vote_count: number
  release_date: string
  genre_ids: number[]
  popularity: number
  character: string
  adult: boolean
  original_language: string
  original_title: string
  video: boolean
}

export interface TmdbPersonCreditsDto {
  id: number
  cast: TmdbPersonMovieCreditDto[]
}

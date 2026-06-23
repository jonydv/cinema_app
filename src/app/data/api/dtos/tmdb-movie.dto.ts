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

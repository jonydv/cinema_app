/** Internal representation of a movie — camelCase, normalized URLs, ready for the UI. */
export interface Movie {
  id: number
  title: string
  overview: string
  posterUrl: string
  backdropUrl: string
  rating: number
  voteCount: number
  releaseDate: string
  releaseYear: number
  genreIds: number[]
  popularity: number
}

export interface Actor {
  id: number
  name: string
  character: string
  profileUrl: string
}

export interface MovieDetail extends Movie {
  cast: Actor[]
  trailerKey: string | null
  runtime: number
  genres: string[]
  tagline: string
}

export interface PagedMovies {
  movies: Movie[]
  totalPages: number
  totalResults: number
}

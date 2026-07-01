import { TmdbService } from '@data/api/tmdb.service'
import { createMovieListStore } from '@store/connectors/movie-list-store.factory'

export const TopRatedStore = createMovieListStore(
  (tmdb: TmdbService) => tmdb.getTopRated(1),
  'top_rated_load_failed',
)

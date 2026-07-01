import { TmdbService } from '@data/api/tmdb.service'
import { createMovieListStore } from '@store/connectors/movie-list-store.factory'

export const UpcomingStore = createMovieListStore(
  (tmdb: TmdbService) => tmdb.getUpcoming(1),
  'upcoming_load_failed',
)

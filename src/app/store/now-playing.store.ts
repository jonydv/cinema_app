import { TmdbService } from '@data/api/tmdb.service'
import { createMovieListStore } from '@store/connectors/movie-list-store.factory'

export const NowPlayingStore = createMovieListStore(
  (tmdb: TmdbService) => tmdb.getNowPlaying(1),
  'now_playing_load_failed',
)

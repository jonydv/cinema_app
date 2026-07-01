import { inject, Injectable } from '@angular/core'

import { Movie } from '@data/models/movie.model'
import { FavoritesStore } from '@store/favorites.store'
import { MovieSection, MoviesStore } from '@store/movies.store'
import { NowPlayingStore } from '@store/now-playing.store'
import { TopRatedStore } from '@store/top-rated.store'
import { TrendingStore } from '@store/trending.store'
import { UpcomingStore } from '@store/upcoming.store'
import { WatchedStore } from '@store/watched.store'
import { WatchlistStore } from '@store/watchlist.store'

@Injectable({ providedIn: 'root' })
export class HomeFacade {
  private readonly moviesStore = inject(MoviesStore)
  private readonly favoritesStore = inject(FavoritesStore)
  private readonly trendingStore = inject(TrendingStore)
  private readonly watchlistStore = inject(WatchlistStore)
  private readonly nowPlayingStore = inject(NowPlayingStore)
  private readonly topRatedStore = inject(TopRatedStore)
  private readonly upcomingStore = inject(UpcomingStore)
  private readonly watchedStore = inject(WatchedStore)

  // Populares grid
  readonly movies = this.moviesStore.movies
  readonly isLoading = this.moviesStore.isLoading
  readonly hasMore = this.moviesStore.hasMore
  readonly activeSection = this.moviesStore.activeSection
  readonly activeGenre = this.moviesStore.activeGenre
  readonly sortBy = this.moviesStore.sortBy
  readonly yearFrom = this.moviesStore.yearFrom
  readonly yearTo = this.moviesStore.yearTo
  readonly minRating = this.moviesStore.minRating
  readonly minRuntime = this.moviesStore.minRuntime
  readonly maxRuntime = this.moviesStore.maxRuntime

  // Carousels
  readonly nowPlaying = this.nowPlayingStore.entities
  readonly nowPlayingLoading = this.nowPlayingStore.isLoading
  readonly trending = this.trendingStore.entities
  readonly trendingLoading = this.trendingStore.isLoading
  readonly topRated = this.topRatedStore.entities
  readonly topRatedLoading = this.topRatedStore.isLoading
  readonly upcoming = this.upcomingStore.entities
  readonly upcomingLoading = this.upcomingStore.isLoading

  init(): void {
    this.moviesStore.loadMovies()
    // Carousel stores auto-load via withHooks.onInit
  }

  loadMore(): void {
    if (!this.moviesStore.hasMore() || this.moviesStore.isLoading()) return
    this.moviesStore.loadMore()
  }

  toggleFavorite(movie: Movie): void {
    this.favoritesStore.toggleFavorite(movie)
  }

  isFavorite(id: number): boolean {
    return this.favoritesStore.isFavorite(id)
  }

  toggleWatchlist(movie: Movie): void {
    this.watchlistStore.toggleWatchlist(movie)
  }

  isInWatchlist(id: number): boolean {
    return this.watchlistStore.isInWatchlist(id)
  }

  toggleWatched(movie: Movie): void {
    if (this.watchedStore.isWatched(movie.id)) {
      this.watchedStore.markUnwatched(movie.id)
    } else {
      this.watchedStore.markWatched(movie)
    }
  }

  isWatched(id: number): boolean {
    return this.watchedStore.isWatched(id)
  }

  setSection(section: MovieSection): void {
    this.moviesStore.setSection(section)
    this.moviesStore.loadMovies()
  }

  setGenre(id: number | null): void {
    this.moviesStore.setGenre(id)
    this.moviesStore.loadMovies()
  }

  setSortBy(sort: string): void {
    this.moviesStore.setSortBy(sort)
    this.moviesStore.loadMovies()
  }

  setYearRange(from: number | null, to: number | null): void {
    this.moviesStore.setYearRange(from, to)
    this.moviesStore.loadMovies()
  }

  setMinRating(rating: number): void {
    this.moviesStore.setMinRating(rating)
    this.moviesStore.loadMovies()
  }

  setRuntimeRange(min: number | null, max: number | null): void {
    this.moviesStore.setRuntimeRange(min, max)
    this.moviesStore.loadMovies()
  }
}

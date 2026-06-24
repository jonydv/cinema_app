import { inject, Injectable } from '@angular/core'

import { Movie } from '@data/models/movie.model'
import { FavoritesStore } from '@store/favorites.store'
import { MovieDetailStore } from '@store/movie-detail.store'
import { RatingsStore } from '@store/ratings.store'
import { RecommendationsStore } from '@store/recommendations.store'
import { WatchlistStore } from '@store/watchlist.store'

@Injectable({ providedIn: 'root' })
export class DetailsFacade {
  private readonly detailStore = inject(MovieDetailStore)
  private readonly favoritesStore = inject(FavoritesStore)
  private readonly watchlistStore = inject(WatchlistStore)
  private readonly ratingsStore = inject(RatingsStore)
  private readonly recommendationsStore = inject(RecommendationsStore)

  readonly movie = this.detailStore.movie
  readonly isLoading = this.detailStore.isLoading
  readonly error = this.detailStore.error
  readonly watchProviders = this.detailStore.watchProviders

  readonly recommendations = this.recommendationsStore.entities
  readonly recommendationsLoading = this.recommendationsStore.isLoading

  loadMovie(id: number): void {
    this.detailStore.loadMovie(id)
    this.recommendationsStore.load(id)
  }

  clear(): void {
    this.detailStore.clearMovie()
    this.recommendationsStore.clear()
  }

  isFavorite(id: number): boolean {
    return this.favoritesStore.isFavorite(id)
  }

  toggleFavorite(movie: Movie): void {
    this.favoritesStore.toggleFavorite(movie)
  }

  isInWatchlist(id: number): boolean {
    return this.watchlistStore.isInWatchlist(id)
  }

  toggleWatchlist(movie: Movie): void {
    this.watchlistStore.toggleWatchlist(movie)
  }

  getRating(movieId: number): number {
    return this.ratingsStore.getRating(movieId)
  }

  setRating(movieId: number, stars: number): void {
    this.ratingsStore.setRating(movieId, stars)
  }
}

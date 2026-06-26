import { inject, Injectable } from '@angular/core'
import { Router } from '@angular/router'

import { Movie, MovieDetail } from '@data/models/movie.model'
import { FavoritesStore } from '@store/favorites.store'
import { MovieDetailStore } from '@store/movie-detail.store'
import { MoviesStore } from '@store/movies.store'
import { RatingsStore } from '@store/ratings.store'
import { RecommendationsStore } from '@store/recommendations.store'
import { WatchedStore } from '@store/watched.store'
import { WatchlistStore } from '@store/watchlist.store'

@Injectable({ providedIn: 'root' })
export class DetailsFacade {
  private readonly detailStore = inject(MovieDetailStore)
  private readonly favoritesStore = inject(FavoritesStore)
  private readonly watchlistStore = inject(WatchlistStore)
  private readonly ratingsStore = inject(RatingsStore)
  private readonly recommendationsStore = inject(RecommendationsStore)
  private readonly watchedStore = inject(WatchedStore)
  private readonly moviesStore = inject(MoviesStore)
  private readonly router = inject(Router)

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

  isWatched(id: number): boolean {
    return this.watchedStore.isWatched(id)
  }

  toggleWatched(movie: MovieDetail): void {
    if (this.watchedStore.isWatched(movie.id)) {
      this.watchedStore.markUnwatched(movie.id)
    } else {
      this.watchedStore.markWatched({
        id: movie.id,
        title: movie.title,
        posterUrl: movie.posterUrl,
        rating: movie.rating,
        overview: movie.overview,
        backdropUrl: movie.backdropUrl,
        releaseDate: movie.releaseDate,
        releaseYear: movie.releaseYear,
        genreIds: [],
        voteCount: movie.voteCount,
        popularity: 0,
      })
    }
  }

  navigateToGenre(genreId: number): void {
    this.moviesStore.setGenre(genreId)
    void this.router.navigate(['/'])
  }

  watchedAt(id: number): Date | null {
    const entry = this.watchedStore.watched()[id]
    return entry ? new Date(entry.date) : null
  }
}

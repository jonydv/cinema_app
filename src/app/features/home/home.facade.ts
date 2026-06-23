import { inject, Injectable } from '@angular/core'

import { Movie } from '@data/models/movie.model'
import { FavoritesStore } from '@store/favorites.store'
import { MoviesStore } from '@store/movies.store'

@Injectable({ providedIn: 'root' })
export class HomeFacade {
  private readonly moviesStore = inject(MoviesStore)
  private readonly favoritesStore = inject(FavoritesStore)

  readonly movies = this.moviesStore.movies
  readonly isLoading = this.moviesStore.isLoading
  readonly hasMore = this.moviesStore.hasMore
  readonly activeGenre = this.moviesStore.activeGenre
  readonly sortBy = this.moviesStore.sortBy

  init(): void {
    this.moviesStore.loadMovies()
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

  setGenre(id: number | null): void {
    this.moviesStore.setGenre(id)
    this.moviesStore.loadMovies()
  }

  setSortBy(sort: string): void {
    this.moviesStore.setSortBy(sort)
    this.moviesStore.loadMovies()
  }
}

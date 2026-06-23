import { inject, Injectable } from '@angular/core'

import { Movie } from '@data/models/movie.model'
import { FavoritesStore } from '@store/favorites.store'
import { MovieDetailStore } from '@store/movie-detail.store'

@Injectable({ providedIn: 'root' })
export class DetailsFacade {
  private readonly detailStore = inject(MovieDetailStore)
  private readonly favoritesStore = inject(FavoritesStore)

  readonly movie = this.detailStore.movie
  readonly isLoading = this.detailStore.isLoading
  readonly error = this.detailStore.error

  loadMovie(id: number): void {
    this.detailStore.loadMovie(id)
  }

  clear(): void {
    this.detailStore.clearMovie()
  }

  isFavorite(id: number): boolean {
    return this.favoritesStore.isFavorite(id)
  }

  toggleFavorite(movie: Movie): void {
    this.favoritesStore.toggleFavorite(movie)
  }
}

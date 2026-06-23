import { inject, Injectable } from '@angular/core'

import { Movie } from '@data/models/movie.model'
import { FavoritesStore } from '@store/favorites.store'

@Injectable({ providedIn: 'root' })
export class FavoritesFacade {
  private readonly store = inject(FavoritesStore)

  readonly favorites = this.store.favorites
  readonly count = this.store.count

  toggleFavorite(movie: Movie): void {
    this.store.toggleFavorite(movie)
  }

  clearAll(): void {
    this.store.clearAll()
  }
}

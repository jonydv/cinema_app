import { inject, Injectable } from '@angular/core'

import { Movie } from '@data/models/movie.model'
import { FavoritesStore } from '@store/favorites.store'
import { WatchlistStore } from '@store/watchlist.store'

@Injectable({ providedIn: 'root' })
export class WatchlistFacade {
  private readonly store = inject(WatchlistStore)
  private readonly favoritesStore = inject(FavoritesStore)

  readonly watchlist = this.store.watchlist
  readonly count = this.store.count

  toggleWatchlist(movie: Movie): void {
    this.store.toggleWatchlist(movie)
  }

  clearAll(): void {
    this.store.clearAll()
  }

  isFavorite(id: number): boolean {
    return this.favoritesStore.isFavorite(id)
  }

  toggleFavorite(movie: Movie): void {
    this.favoritesStore.toggleFavorite(movie)
  }
}

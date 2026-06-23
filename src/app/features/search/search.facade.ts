import { inject, Injectable } from '@angular/core'

import { Movie } from '@data/models/movie.model'
import { FavoritesStore } from '@store/favorites.store'
import { SearchStore } from '@store/search.store'

@Injectable({ providedIn: 'root' })
export class SearchFacade {
  private readonly searchStore = inject(SearchStore)
  private readonly favoritesStore = inject(FavoritesStore)

  readonly results = this.searchStore.results
  readonly isLoading = this.searchStore.isLoading
  readonly query = this.searchStore.query
  readonly totalResults = this.searchStore.totalResults

  search(q: string): void {
    this.searchStore.search(q)
  }

  clear(): void {
    this.searchStore.clear()
  }

  isFavorite(id: number): boolean {
    return this.favoritesStore.isFavorite(id)
  }

  toggleFavorite(movie: Movie): void {
    this.favoritesStore.toggleFavorite(movie)
  }
}

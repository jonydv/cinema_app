import { ChangeDetectionStrategy, Component, effect, inject, input, OnDestroy } from '@angular/core'

import { TranslocoModule } from '@ngneat/transloco'

import { SeoMetadataService } from '@core/seo/seo-metadata.service'

import { Movie } from '@data/models/movie.model'
import { FavoritesStore } from '@store/favorites.store'
import { PersonStore } from '@store/person.store'
import { WatchlistStore } from '@store/watchlist.store'

import { EmptyStateComponent } from '@shared/ui/empty-state/empty-state.component'
import { MovieCardComponent } from '@shared/ui/movie-card/movie-card.component'

@Component({
  selector: 'app-person-page',
  standalone: true,
  imports: [TranslocoModule, MovieCardComponent, EmptyStateComponent],
  templateUrl: './person.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PersonPage implements OnDestroy {
  protected readonly store = inject(PersonStore)
  private readonly favoritesStore = inject(FavoritesStore)
  private readonly watchlistStore = inject(WatchlistStore)
  private readonly seo = inject(SeoMetadataService)

  readonly id = input.required<string>()

  constructor() {
    effect(() => {
      this.store.loadPerson(Number(this.id()))
    })

    effect(() => {
      const person = this.store.person()
      if (!person) return
      this.seo.setPageTitle(person.name)
      this.seo.setMetaDescription(person.biography.slice(0, 160))
    })
  }

  ngOnDestroy(): void {
    this.store.clearPerson()
  }

  protected isFavorite(id: number): boolean {
    return this.favoritesStore.isFavorite(id)
  }

  protected toggleFavorite(movie: Movie): void {
    this.favoritesStore.toggleFavorite(movie)
  }

  protected isInWatchlist(id: number): boolean {
    return this.watchlistStore.isInWatchlist(id)
  }

  protected toggleWatchlist(movie: Movie): void {
    this.watchlistStore.toggleWatchlist(movie)
  }
}

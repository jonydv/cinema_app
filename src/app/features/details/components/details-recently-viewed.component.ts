import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core'

import { TranslocoModule } from '@ngneat/transloco'

import { CarouselComponent } from '@shared/ui/carousel/carousel.component'
import { MovieCardComponent } from '@shared/ui/movie-card/movie-card.component'

import { DetailsFacade } from '../details.facade'

@Component({
  selector: 'app-details-recently-viewed',
  standalone: true,
  imports: [TranslocoModule, CarouselComponent, MovieCardComponent],
  template: `
    @if (others().length > 0) {
      <section class="pb-28 pt-2 md:pb-10">
        <h2 class="mb-2 px-4 text-sm font-semibold text-(--color-text-secondary) md:px-6">
          {{ 'movie.recentlyViewed' | transloco }}
        </h2>
        <app-carousel role="list">
          @for (movie of others(); track movie.id) {
            <div class="w-[120px] shrink-0 snap-center md:w-[140px]" role="listitem">
              <app-movie-card
                [movie]="movie"
                [isFavorite]="facade.isFavorite(movie.id)"
                [isInWatchlist]="facade.isInWatchlist(movie.id)"
                (favoriteToggled)="facade.toggleFavorite($event)"
                (watchlistToggled)="facade.toggleWatchlist($event)"
              />
            </div>
          }
        </app-carousel>
      </section>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailsRecentlyViewedComponent {
  protected readonly facade = inject(DetailsFacade)
  protected readonly others = computed(() => this.facade.recentlyViewed().slice(1))
}

import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core'

import { TranslocoModule } from '@ngneat/transloco'

import { Movie } from '@data/models/movie.model'

import { CarouselComponent } from '@shared/ui/carousel/carousel.component'
import { MovieCardComponent } from '@shared/ui/movie-card/movie-card.component'

import { HomeFacade } from '../home.facade'

@Component({
  selector: 'app-carousel-section',
  standalone: true,
  imports: [TranslocoModule, CarouselComponent, MovieCardComponent],
  template: `
    <section class="mb-6">
      <h2 class="mb-3 px-4 text-base font-semibold text-(--color-text-primary) md:px-6">
        {{ emoji() }} {{ titleKey() | transloco }}
      </h2>

      @if (isLoading()) {
        <div class="scrollbar-hide flex gap-3 overflow-x-auto px-4 pb-2 md:px-6">
          @for (i of skeletons(); track i) {
            <div
              class="skeleton-shimmer h-[225px] w-[150px] shrink-0 rounded-xl md:h-[270px] md:w-[180px]"
            ></div>
          }
        </div>
      } @else {
        <app-carousel role="list">
          @for (movie of movies(); track movie.id) {
            <div class="w-[150px] shrink-0 snap-center md:w-[180px]" role="listitem">
              <app-movie-card
                [movie]="movie"
                [isFavorite]="facade.isFavorite(movie.id)"
                [isInWatchlist]="facade.isInWatchlist(movie.id)"
                [isWatched]="facade.isWatched(movie.id)"
                (favoriteToggled)="facade.toggleFavorite($event)"
                (watchlistToggled)="facade.toggleWatchlist($event)"
                (watchedToggled)="facade.toggleWatched($event)"
              />
            </div>
          }
        </app-carousel>
      }
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarouselSectionComponent {
  readonly movies = input<Movie[]>([])
  readonly isLoading = input(false)
  readonly emoji = input('')
  readonly titleKey = input.required<string>()
  readonly skeletonCount = input(6)

  protected readonly facade = inject(HomeFacade)
  protected readonly skeletons = computed(() =>
    Array.from({ length: this.skeletonCount() }, (_, i) => i),
  )
}

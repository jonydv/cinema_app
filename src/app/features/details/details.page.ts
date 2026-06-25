import { DatePipe } from '@angular/common'
import { ChangeDetectionStrategy, Component, effect, inject, input, OnDestroy } from '@angular/core'

import { TranslocoModule } from '@ngneat/transloco'

import { SeoMetadataService } from '@core/seo/seo-metadata.service'

import { CarouselComponent } from '@shared/ui/carousel/carousel.component'
import { EmptyStateComponent } from '@shared/ui/empty-state/empty-state.component'
import { MovieCardComponent } from '@shared/ui/movie-card/movie-card.component'
import { YoutubePlayerComponent } from '@shared/ui/youtube-player/youtube-player.component'

import { DetailsBackdropComponent } from './components/details-backdrop.component'
import { DetailsCastComponent } from './components/details-cast.component'
import { DetailsFacade } from './details.facade'

@Component({
  selector: 'app-details-page',
  standalone: true,
  imports: [
    DatePipe,
    TranslocoModule,
    DetailsBackdropComponent,
    DetailsCastComponent,
    YoutubePlayerComponent,
    EmptyStateComponent,
    MovieCardComponent,
    CarouselComponent,
  ],
  templateUrl: './details.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailsPage implements OnDestroy {
  protected readonly facade = inject(DetailsFacade)
  private readonly seo = inject(SeoMetadataService)

  readonly id = input.required<string>()

  constructor() {
    effect(() => {
      this.facade.loadMovie(Number(this.id()))
    })

    effect(() => {
      const movie = this.facade.movie()
      if (!movie) return
      this.seo.setPageTitle(movie.title)
      this.seo.setMetaDescription(movie.overview.slice(0, 160))
      this.seo.setOgImage(movie.backdropUrl)
      this.seo.setJsonLd({
        '@context': 'https://schema.org',
        '@type': 'Movie',
        name: movie.title,
        description: movie.overview,
        image: movie.posterUrl,
        datePublished: movie.releaseDate,
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: movie.rating,
          ratingCount: movie.voteCount,
        },
      })
    })
  }

  ngOnDestroy(): void {
    this.facade.clear()
  }
}

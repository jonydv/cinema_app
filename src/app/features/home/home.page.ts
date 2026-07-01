import { LiveAnnouncer } from '@angular/cdk/a11y'
import { ChangeDetectionStrategy, Component, effect, inject, OnInit, signal } from '@angular/core'

import { TranslocoService, TranslocoModule } from '@ngneat/transloco'

import { SeoMetadataService } from '@core/seo/seo-metadata.service'

import { MovieSection } from '@store/movies.store'

import { InfiniteScrollDirective } from '@shared/directives/infinite-scroll.directive'
import { EmptyStateComponent } from '@shared/ui/empty-state/empty-state.component'
import { MovieCardComponent } from '@shared/ui/movie-card/movie-card.component'
import { SkeletonCardComponent } from '@shared/ui/skeleton-card/skeleton-card.component'

import { CarouselSectionComponent } from './components/carousel-section.component'
import { HomeFiltersComponent } from './components/home-filters.component'
import { HomeFacade } from './home.facade'

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    TranslocoModule,
    MovieCardComponent,
    SkeletonCardComponent,
    EmptyStateComponent,
    InfiniteScrollDirective,
    HomeFiltersComponent,
    CarouselSectionComponent,
  ],
  templateUrl: './home.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage implements OnInit {
  protected readonly facade = inject(HomeFacade)
  private readonly seo = inject(SeoMetadataService)
  private readonly liveAnnouncer = inject(LiveAnnouncer)
  private readonly transloco = inject(TranslocoService)

  protected readonly skeletonRange = Array.from({ length: 8 }, (_, i) => i)
  protected readonly activeTab = signal<'popular' | 'discover'>('popular')
  protected readonly sections: { key: MovieSection; label: string; icon: string }[] = [
    { key: 'popular', label: 'home.popular', icon: '📊' },
    { key: 'top-rated', label: 'home.topRated', icon: '⭐' },
    { key: 'now-playing', label: 'home.nowPlaying', icon: '🎬' },
    { key: 'upcoming', label: 'home.upcoming', icon: '📅' },
  ]

  constructor() {
    effect(() => {
      const count = this.facade.movies().length
      if (count > 0 && !this.facade.isLoading()) {
        const msg = this.transloco.translate('a11y.moviesLoaded', { count })
        void this.liveAnnouncer.announce(msg, 'polite')
      }
    })
  }

  ngOnInit(): void {
    this.seo.setPageTitle('Películas populares')
    this.seo.setMetaDescription('Descubre las películas más populares del momento.')
    this.facade.init()
  }

  protected onScrolled(): void {
    this.facade.loadMore()
  }

  protected onSectionChange(section: MovieSection): void {
    this.facade.setSection(section)
  }
}

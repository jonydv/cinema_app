import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core'

import { TranslocoModule } from '@ngneat/transloco'

import { SeoMetadataService } from '@core/seo/seo-metadata.service'

import { InfiniteScrollDirective } from '@shared/directives/infinite-scroll.directive'
import { EmptyStateComponent } from '@shared/ui/empty-state/empty-state.component'
import { MovieCardComponent } from '@shared/ui/movie-card/movie-card.component'
import { SkeletonCardComponent } from '@shared/ui/skeleton-card/skeleton-card.component'

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
  ],
  templateUrl: './home.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage implements OnInit {
  protected readonly facade = inject(HomeFacade)
  private readonly seo = inject(SeoMetadataService)

  protected readonly skeletonRange = Array.from({ length: 8 }, (_, i) => i)

  ngOnInit(): void {
    this.seo.setPageTitle('Películas populares')
    this.seo.setMetaDescription('Descubre las películas más populares del momento.')
    this.facade.init()
  }

  protected onScrolled(): void {
    this.facade.loadMore()
  }
}

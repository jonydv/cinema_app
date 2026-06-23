import { ChangeDetectionStrategy, Component, effect, inject, input, OnDestroy } from '@angular/core'
import { Router } from '@angular/router'

import { TranslocoModule } from '@ngneat/transloco'

import { SeoMetadataService } from '@core/seo/seo-metadata.service'

import { EmptyStateComponent } from '@shared/ui/empty-state/empty-state.component'
import { MovieCardComponent } from '@shared/ui/movie-card/movie-card.component'
import { SkeletonCardComponent } from '@shared/ui/skeleton-card/skeleton-card.component'

import { SearchBarComponent } from './components/search-bar.component'
import { SearchFacade } from './search.facade'

@Component({
  selector: 'app-search-page',
  standalone: true,
  imports: [
    TranslocoModule,
    SearchBarComponent,
    MovieCardComponent,
    SkeletonCardComponent,
    EmptyStateComponent,
  ],
  templateUrl: './search.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchPage implements OnDestroy {
  protected readonly facade = inject(SearchFacade)
  private readonly router = inject(Router)
  private readonly seo = inject(SeoMetadataService)

  /** Bound from the ?q= query param via withComponentInputBinding */
  readonly q = input<string>('')

  protected readonly skeletonRange = Array.from({ length: 8 }, (_, i) => i)

  constructor() {
    this.seo.setPageTitle('Buscar películas')

    effect(() => {
      const query = this.q()
      if (query) {
        this.facade.search(query)
      } else {
        this.facade.clear()
      }
    })
  }

  protected onSearch(query: string): void {
    this.router.navigate([], {
      queryParams: { q: query || null },
      replaceUrl: true,
    })
    this.facade.search(query)
  }

  ngOnDestroy(): void {
    this.facade.clear()
  }
}

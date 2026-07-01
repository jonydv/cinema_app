import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core'

import { TranslocoModule } from '@ngneat/transloco'

import { SeoMetadataService } from '@core/seo/seo-metadata.service'

import { EmptyStateComponent } from '@shared/ui/empty-state/empty-state.component'
import { MovieCardComponent } from '@shared/ui/movie-card/movie-card.component'
import { MovieGridComponent } from '@shared/ui/movie-grid/movie-grid.component'

import { FavoritesFacade } from './favorites.facade'

@Component({
  selector: 'app-favorites-page',
  standalone: true,
  imports: [TranslocoModule, MovieCardComponent, EmptyStateComponent, MovieGridComponent],
  templateUrl: './favorites.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FavoritesPage implements OnInit {
  protected readonly facade = inject(FavoritesFacade)
  private readonly seo = inject(SeoMetadataService)

  protected readonly isConfirming = signal(false)

  ngOnInit(): void {
    this.seo.setPageTitle('Mis favoritos')
  }

  protected startClear(): void {
    this.isConfirming.set(true)
  }

  protected confirmClear(): void {
    this.facade.clearAll()
    this.isConfirming.set(false)
  }

  protected cancelClear(): void {
    this.isConfirming.set(false)
  }
}

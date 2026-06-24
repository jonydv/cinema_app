import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core'

import { TranslocoModule } from '@ngneat/transloco'

import { SeoMetadataService } from '@core/seo/seo-metadata.service'

import { EmptyStateComponent } from '@shared/ui/empty-state/empty-state.component'
import { MovieCardComponent } from '@shared/ui/movie-card/movie-card.component'

import { WatchlistFacade } from './watchlist.facade'

@Component({
  selector: 'app-watchlist-page',
  standalone: true,
  imports: [TranslocoModule, MovieCardComponent, EmptyStateComponent],
  templateUrl: './watchlist.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WatchlistPage implements OnInit {
  protected readonly facade = inject(WatchlistFacade)
  private readonly seo = inject(SeoMetadataService)

  protected readonly isConfirming = signal(false)

  ngOnInit(): void {
    this.seo.setPageTitle('Mi lista')
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

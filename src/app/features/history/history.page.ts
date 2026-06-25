import { DatePipe } from '@angular/common'
import { ChangeDetectionStrategy, Component, computed, inject, OnInit } from '@angular/core'

import { TranslocoModule } from '@ngneat/transloco'

import { SeoMetadataService } from '@core/seo/seo-metadata.service'

import { WatchedStore } from '@store/watched.store'

import { EmptyStateComponent } from '@shared/ui/empty-state/empty-state.component'

interface MonthGroup {
  label: string
  entries: Array<{ id: number; date: string; title: string; posterUrl: string; rating: number }>
}

@Component({
  selector: 'app-history-page',
  standalone: true,
  imports: [TranslocoModule, DatePipe, EmptyStateComponent],
  templateUrl: './history.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistoryPage implements OnInit {
  private readonly watchedStore = inject(WatchedStore)
  private readonly seo = inject(SeoMetadataService)

  readonly watchedCount = this.watchedStore.watchedCount
  readonly isEmpty = computed(() => this.watchedStore.watchedCount() === 0)

  readonly groupedByMonth = computed<MonthGroup[]>(() => {
    const list = this.watchedStore.watchedList()
    const map = new Map<string, MonthGroup>()

    for (const entry of list) {
      const d = new Date(entry.date)
      const key = `${d.getFullYear()}-${d.getMonth()}`
      if (!map.has(key)) {
        map.set(key, {
          label: d.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }),
          entries: [],
        })
      }
      map.get(key)!.entries.push(entry)
    }

    return Array.from(map.values())
  })

  ngOnInit(): void {
    this.seo.setPageTitle('Historial')
    this.seo.setMetaDescription('Tu historial de películas vistas.')
  }

  removeFromHistory(id: number): void {
    this.watchedStore.markUnwatched(id)
  }

  clearAll(): void {
    this.watchedStore.clearAll()
  }
}

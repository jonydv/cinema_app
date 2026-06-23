import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core'

import { TranslocoModule } from '@ngneat/transloco'

import { BottomSheetComponent } from '@shared/ui/bottom-sheet/bottom-sheet.component'

import { HomeFacade } from '../home.facade'

interface Genre {
  id: number | null
  label: string
}

interface SortOption {
  value: string
  labelKey: string
}

const GENRES: Genre[] = [
  { id: null, label: 'Todos' },
  { id: 28, label: 'Acción' },
  { id: 35, label: 'Comedia' },
  { id: 18, label: 'Drama' },
  { id: 27, label: 'Terror' },
  { id: 878, label: 'Sci-Fi' },
  { id: 10749, label: 'Romance' },
  { id: 16, label: 'Animación' },
  { id: 53, label: 'Thriller' },
  { id: 12, label: 'Aventura' },
]

const SORT_OPTIONS: SortOption[] = [
  { value: 'popularity.desc', labelKey: 'filters.popularity' },
  { value: 'vote_average.desc', labelKey: 'filters.rating' },
  { value: 'primary_release_date.desc', labelKey: 'filters.releaseDate' },
]

@Component({
  selector: 'app-home-filters',
  standalone: true,
  imports: [BottomSheetComponent, TranslocoModule],
  templateUrl: './home-filters.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeFiltersComponent {
  protected readonly facade = inject(HomeFacade)
  protected readonly isOpen = signal(false)
  protected readonly genres = GENRES
  protected readonly sortOptions = SORT_OPTIONS

  open(): void {
    this.isOpen.set(true)
  }

  close(): void {
    this.isOpen.set(false)
  }

  selectGenre(id: number | null): void {
    this.facade.setGenre(id)
    this.close()
  }

  selectSort(value: string): void {
    this.facade.setSortBy(value)
    this.close()
  }

  onSortChange(event: Event): void {
    this.selectSort((event.target as HTMLSelectElement).value)
  }

  genreChipClass(id: number | null): string {
    const base = 'px-3 py-1.5 rounded-full text-sm font-medium border transition-colors'
    const active = 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
    const inactive =
      'border-[var(--color-border)] text-[var(--color-text-secondary)] md:hover:border-[var(--color-primary)]'
    return `${base} ${this.facade.activeGenre() === id ? active : inactive}`
  }

  sortRowClass(value: string): string {
    const base =
      'flex items-center justify-between rounded-lg p-3 text-left transition-colors min-h-[48px] w-full'
    const active = 'text-[var(--color-primary)] font-semibold'
    const inactive = 'text-[var(--color-text-primary)]'
    return `${base} ${this.facade.sortBy() === value ? active : inactive}`
  }
}

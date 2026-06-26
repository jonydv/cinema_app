import { NgTemplateOutlet } from '@angular/common'
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'

import { switchMap } from 'rxjs/operators'

import { TranslocoModule, TranslocoService } from '@ngneat/transloco'

import { TmdbService } from '@data/api/tmdb.service'

import { BottomSheetComponent } from '@shared/ui/bottom-sheet/bottom-sheet.component'
import { RangeSliderComponent } from '@shared/ui/range-slider/range-slider.component'

import { HomeFacade } from '../home.facade'

interface SortOption {
  value: string
  labelKey: string
}

const SORT_OPTIONS: SortOption[] = [
  { value: 'popularity.desc', labelKey: 'filters.popularity' },
  { value: 'vote_average.desc', labelKey: 'filters.rating' },
  { value: 'primary_release_date.desc', labelKey: 'filters.releaseDate' },
]

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: CURRENT_YEAR - 1970 + 1 }, (_, i) => CURRENT_YEAR - i)

const DURATION_OPTIONS = [
  { labelKey: 'filters.durationAny', min: null as number | null, max: null as number | null },
  { labelKey: 'filters.durationShort', min: null as number | null, max: 90 as number | null },
  { labelKey: 'filters.durationMedium', min: 90 as number | null, max: 150 as number | null },
  { labelKey: 'filters.durationLong', min: 150 as number | null, max: null as number | null },
]

@Component({
  selector: 'app-home-filters',
  standalone: true,
  imports: [BottomSheetComponent, TranslocoModule, RangeSliderComponent, NgTemplateOutlet],
  templateUrl: './home-filters.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeFiltersComponent {
  protected readonly facade = inject(HomeFacade)
  private readonly tmdb = inject(TmdbService)

  protected readonly isOpen = signal(false)
  protected readonly genres = signal<{ id: number; name: string }[]>([])
  protected readonly sortOptions = SORT_OPTIONS
  protected readonly durationOptions = DURATION_OPTIONS

  constructor() {
    inject(TranslocoService)
      .langChanges$.pipe(
        switchMap(() => this.tmdb.getGenres()),
        takeUntilDestroyed(),
      )
      .subscribe((g) => this.genres.set(g))
  }

  protected yearsFrom(): number[] {
    const to = this.facade.yearTo()
    return to !== null ? YEARS.filter((y) => y <= to) : YEARS
  }

  protected yearsTo(): number[] {
    const from = this.facade.yearFrom()
    return from !== null ? YEARS.filter((y) => y >= from) : YEARS
  }

  open(): void {
    this.isOpen.set(true)
  }

  close(): void {
    this.isOpen.set(false)
  }

  selectGenre(id: number | null): void {
    this.facade.setGenre(id)
  }

  onYearFromChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value
    const from = val ? Number(val) : null
    const to = this.facade.yearTo()
    this.facade.setYearRange(from, from !== null && to !== null && to < from ? null : to)
  }

  onYearToChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value
    const to = val ? Number(val) : null
    const from = this.facade.yearFrom()
    this.facade.setYearRange(from !== null && to !== null && from > to ? null : from, to)
  }

  onRatingChange(rating: number): void {
    this.facade.setMinRating(rating)
  }

  onDurationSelect(min: number | null, max: number | null): void {
    this.facade.setRuntimeRange(min, max)
    this.close()
  }

  onSortChange(event: Event): void {
    this.facade.setSortBy((event.target as HTMLSelectElement).value)
  }

  clearFilters(): void {
    this.facade.setGenre(null)
    this.facade.setYearRange(null, null)
    this.facade.setMinRating(0)
    this.facade.setRuntimeRange(null, null)
    this.facade.setSortBy('popularity.desc')
    this.close()
  }

  genreChipClass(id: number | null): string {
    const base =
      'px-3 py-1.5 rounded-full text-sm font-medium border transition-colors min-h-[36px]'
    const active = 'bg-(--color-primary) text-white border-(--color-primary)'
    const inactive =
      'border-(--color-border) text-(--color-text-secondary) md:hover:border-(--color-primary)'
    return `${base} ${this.facade.activeGenre() === id ? active : inactive}`
  }

  durationButtonClass(min: number | null, max: number | null): string {
    const base = 'px-3 py-1.5 rounded-lg text-sm border transition-colors min-h-[36px]'
    const isActive = this.facade.minRuntime() === min && this.facade.maxRuntime() === max
    const active = 'bg-(--color-primary) text-white border-(--color-primary)'
    const inactive =
      'border-(--color-border) text-(--color-text-secondary) md:hover:border-(--color-primary)'
    return `${base} ${isActive ? active : inactive}`
  }

  sortRowClass(value: string): string {
    const base =
      'flex items-center justify-between rounded-lg p-3 text-left transition-colors min-h-[48px] w-full'
    const active = 'text-(--color-primary) font-semibold'
    const inactive = 'text-(--color-text-primary)'
    return `${base} ${this.facade.sortBy() === value ? active : inactive}`
  }
}

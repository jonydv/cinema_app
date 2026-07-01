import { DatePipe } from '@angular/common'
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core'

import { TranslocoModule } from '@ngneat/transloco'

import { MovieDetail } from '@data/models/movie.model'

@Component({
  selector: 'app-details-actions',
  standalone: true,
  imports: [TranslocoModule, DatePipe],
  template: `
    <!-- Watchlist button -->
    <section class="px-4 pb-4 md:px-6">
      <button
        type="button"
        class="flex min-h-[44px] items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-colors duration-200"
        [class]="
          isInWatchlist()
            ? 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400'
            : 'border-(--color-border) bg-(--color-surface) text-(--color-text-primary) md:hover:border-blue-400'
        "
        [attr.aria-pressed]="isInWatchlist()"
        (click)="watchlistToggled.emit(movie())"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          aria-hidden="true"
        >
          @if (isInWatchlist()) {
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          } @else {
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          }
        </svg>
        {{ (isInWatchlist() ? 'movie.removeWatchlist' : 'movie.addWatchlist') | transloco }}
      </button>
    </section>

    <!-- Watched button -->
    <section class="px-4 pb-4 md:px-6">
      <button
        type="button"
        class="flex min-h-[44px] items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-colors duration-200"
        [class]="
          isWatched()
            ? 'border-emerald-500 bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'
            : 'border-(--color-border) bg-(--color-surface) text-(--color-text-primary) md:hover:border-emerald-400'
        "
        [attr.aria-pressed]="isWatched()"
        (click)="watchedToggled.emit(movie())"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        </svg>
        @if (isWatched() && watchedAt()) {
          {{ 'history.watchedOn' | transloco: { date: (watchedAt()! | date: 'dd/MM/yyyy') } }}
        } @else {
          {{ 'movie.markWatched' | transloco }}
        }
      </button>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailsActionsComponent {
  readonly movie = input.required<MovieDetail>()
  readonly isInWatchlist = input(false)
  readonly isWatched = input(false)
  readonly watchedAt = input<Date | null>(null)

  readonly watchlistToggled = output<MovieDetail>()
  readonly watchedToggled = output<MovieDetail>()
}

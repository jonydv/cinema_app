import { ChangeDetectionStrategy, Component, input } from '@angular/core'

import { TranslocoModule } from '@ngneat/transloco'

import { MovieReview } from '@data/models/movie.model'

@Component({
  selector: 'app-details-reviews',
  standalone: true,
  imports: [TranslocoModule],
  template: `
    @if (reviews().length > 0) {
      <section class="px-4 pb-6 md:px-6">
        <h2 class="mb-3 text-sm font-semibold text-(--color-text-secondary)">
          {{ 'movie.reviews' | transloco }}
        </h2>
        <div class="flex flex-col gap-3">
          @for (review of reviews(); track review.id) {
            <a
              [href]="review.url"
              target="_blank"
              rel="noopener noreferrer"
              class="block rounded-2xl bg-(--color-surface) p-4 ring-1 ring-black/5 transition-colors md:hover:ring-black/15 dark:ring-white/5 dark:md:hover:ring-white/15"
            >
              <div class="mb-2 flex items-center justify-between gap-2">
                <span class="text-sm font-semibold text-(--color-text-primary)">{{
                  review.author
                }}</span>
                @if (review.rating !== null) {
                  <span
                    class="flex shrink-0 items-center gap-1 rounded-full bg-amber-400/15 px-2 py-0.5 text-xs font-bold text-amber-600 dark:text-amber-400"
                  >
                    ★ {{ review.rating }}/10
                  </span>
                }
              </div>
              <p class="line-clamp-4 text-sm leading-relaxed text-(--color-text-secondary)">
                {{ review.content }}
              </p>
            </a>
          }
        </div>
      </section>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailsReviewsComponent {
  readonly reviews = input<MovieReview[]>([])
}

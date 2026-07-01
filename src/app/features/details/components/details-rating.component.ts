import { ChangeDetectionStrategy, Component, input, output } from '@angular/core'

import { TranslocoModule } from '@ngneat/transloco'

@Component({
  selector: 'app-details-rating',
  standalone: true,
  imports: [TranslocoModule],
  template: `
    <section class="px-4 pb-4 md:px-6">
      <h2 class="mb-2 text-sm font-semibold text-(--color-text-secondary)">
        {{ 'rating.title' | transloco }}
      </h2>
      <div class="flex gap-1" role="group" [attr.aria-label]="'rating.rate' | transloco">
        @for (star of stars; track star) {
          <button
            type="button"
            class="text-2xl leading-none transition-transform duration-150 md:hover:scale-125"
            [attr.aria-label]="star + ' ' + ('rating.stars' | transloco)"
            [attr.aria-pressed]="currentRating() >= star"
            (click)="onStarClick(star)"
          >
            <span [class]="currentRating() >= star ? 'text-amber-400' : 'text-(--color-skeleton)'"
              >★</span
            >
          </button>
        }
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailsRatingComponent {
  readonly currentRating = input(0)
  readonly ratingChanged = output<number>()

  protected readonly stars = [1, 2, 3, 4, 5]

  protected onStarClick(star: number): void {
    this.ratingChanged.emit(this.currentRating() === star ? 0 : star)
  }
}

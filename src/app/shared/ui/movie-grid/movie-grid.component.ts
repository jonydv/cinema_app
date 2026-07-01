import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core'

import { SkeletonCardComponent } from '@shared/ui/skeleton-card/skeleton-card.component'

@Component({
  selector: 'app-movie-grid',
  standalone: true,
  imports: [SkeletonCardComponent],
  template: `
    <div class="grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-5 md:gap-6">
      <ng-content />
      @if (isLoading()) {
        @for (i of skeletons(); track i) {
          <app-skeleton-card />
        }
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieGridComponent {
  readonly isLoading = input(false)
  readonly skeletonCount = input(8)
  protected readonly skeletons = computed(() =>
    Array.from({ length: this.skeletonCount() }, (_, i) => i),
  )
}

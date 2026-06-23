import { ChangeDetectionStrategy, Component } from '@angular/core'

@Component({
  selector: 'app-favorites-page',
  standalone: true,
  template: `
    <div class="p-4">
      <h1 class="text-2xl font-bold text-[var(--color-text-primary)]" tabindex="-1">
        Mis favoritos
      </h1>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FavoritesPage {}

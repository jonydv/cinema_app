import { ChangeDetectionStrategy, Component } from '@angular/core'

@Component({
  selector: 'app-search-page',
  standalone: true,
  template: `
    <div class="p-4">
      <h1 class="text-2xl font-bold text-[var(--color-text-primary)]" tabindex="-1">Buscar</h1>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchPage {}

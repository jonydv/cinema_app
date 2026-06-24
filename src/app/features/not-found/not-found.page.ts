import { ChangeDetectionStrategy, Component } from '@angular/core'
import { RouterLink } from '@angular/router'

import { TranslocoModule } from '@ngneat/transloco'

import { SeoMetadataService } from '@core/seo/seo-metadata.service'

@Component({
  selector: 'app-not-found-page',
  standalone: true,
  imports: [RouterLink, TranslocoModule],
  template: `
    <div class="flex min-h-[70dvh] flex-col items-center justify-center gap-6 p-8 text-center">
      <p class="text-8xl font-black text-(--color-primary)">404</p>
      <h1 class="text-2xl font-bold text-(--color-text-primary)" tabindex="-1">
        {{ 'notFound.title' | transloco }}
      </h1>
      <p class="max-w-sm text-(--color-text-secondary)">
        {{ 'notFound.subtitle' | transloco }}
      </p>
      <a
        routerLink="/"
        class="rounded-lg bg-(--color-primary) px-6 py-3 font-semibold text-white transition-opacity md:hover:opacity-90"
      >
        {{ 'notFound.goHome' | transloco }}
      </a>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundPage {
  constructor(seo: SeoMetadataService) {
    seo.setPageTitle('404 — Página no encontrada')
  }
}

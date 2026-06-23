import { inject, Injectable } from '@angular/core'
import { Meta, Title } from '@angular/platform-browser'

const APP_NAME = 'MovieApp'

@Injectable({ providedIn: 'root' })
export class SeoMetadataService {
  private readonly title = inject(Title)
  private readonly meta = inject(Meta)

  setPageTitle(pageTitle: string): void {
    this.title.setTitle(`${pageTitle} — ${APP_NAME}`)
  }

  setMetaDescription(description: string): void {
    this.meta.updateTag({ name: 'description', content: description })
  }

  setOgImage(imageUrl: string): void {
    this.meta.updateTag({ property: 'og:image', content: imageUrl })
    this.meta.updateTag({ name: 'twitter:image', content: imageUrl })
  }

  /** Injects a JSON-LD structured data block for rich snippets. */
  setJsonLd(schema: Record<string, unknown>): void {
    const existing = document.querySelector<HTMLScriptElement>('script[type="application/ld+json"]')
    const tag = existing ?? document.createElement('script')
    tag.type = 'application/ld+json'
    tag.textContent = JSON.stringify(schema)
    if (!existing) document.head.appendChild(tag)
  }

  resetToDefaults(): void {
    this.title.setTitle(APP_NAME)
    this.meta.updateTag({ name: 'description', content: 'Explora y descubre películas populares.' })
  }
}

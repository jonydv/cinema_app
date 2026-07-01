import { isPlatformBrowser } from '@angular/common'
import { inject, Injectable, PLATFORM_ID } from '@angular/core'
import { Meta, Title } from '@angular/platform-browser'

const APP_NAME = 'CineScope'
const APP_URL = 'https://cinemascope-jdv.vercel.app'
const APP_OG_IMAGE = `${APP_URL}/og-image.png`

@Injectable({ providedIn: 'root' })
export class SeoMetadataService {
  private readonly title = inject(Title)
  private readonly meta = inject(Meta)
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID))

  setPageTitle(pageTitle: string): void {
    this.title.setTitle(`${pageTitle} — ${APP_NAME}`)
  }

  setMetaDescription(description: string): void {
    this.meta.updateTag({ name: 'description', content: description })
  }

  setOgTags(opts: { title?: string; description?: string; imageUrl?: string; url?: string }): void {
    const title = opts.title ?? `${APP_NAME} — Descubre tus películas favoritas`
    const description =
      opts.description ?? 'Descubre y guarda tus películas favoritas con CineScope.'
    const image = opts.imageUrl ?? APP_OG_IMAGE
    const url = opts.url ?? APP_URL
    this.meta.updateTag({ property: 'og:title', content: title })
    this.meta.updateTag({ property: 'og:description', content: description })
    this.meta.updateTag({ property: 'og:image', content: image })
    this.meta.updateTag({ property: 'og:url', content: url })
    this.meta.updateTag({ name: 'twitter:title', content: title })
    this.meta.updateTag({ name: 'twitter:description', content: description })
    this.meta.updateTag({ name: 'twitter:image', content: image })
  }

  /** Injects a JSON-LD structured data block for rich snippets. Browser-only — no-op during SSR. */
  setJsonLd(schema: Record<string, unknown>): void {
    if (!this.isBrowser) return
    const existing = document.querySelector<HTMLScriptElement>('script[type="application/ld+json"]')
    const tag = existing ?? document.createElement('script')
    tag.type = 'application/ld+json'
    tag.textContent = JSON.stringify(schema)
    if (!existing) document.head.appendChild(tag)
  }

  resetToDefaults(): void {
    this.title.setTitle(APP_NAME)
    this.meta.updateTag({
      name: 'description',
      content: 'Descubre y guarda tus películas favoritas con CineScope.',
    })
    this.setOgTags({})
  }
}

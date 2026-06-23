import { isPlatformBrowser } from '@angular/common'
import { effect, inject, Injectable, PLATFORM_ID, signal } from '@angular/core'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'theme'

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID))

  readonly theme = signal<Theme>(this.resolveInitialTheme())

  constructor() {
    effect(() => {
      const current = this.theme()
      if (!this.isBrowser) return
      document.documentElement.setAttribute('data-theme', current)
      localStorage.setItem(STORAGE_KEY, current)
    })
  }

  toggle(): void {
    this.theme.update((t) => (t === 'light' ? 'dark' : 'light'))
  }

  private resolveInitialTheme(): Theme {
    if (!this.isBrowser) return 'light'

    const saved = localStorage.getItem(STORAGE_KEY) as Theme | null
    if (saved === 'light' || saved === 'dark') return saved

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
}

import { isPlatformBrowser } from '@angular/common'
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  PLATFORM_ID,
  signal,
} from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router'

import { filter } from 'rxjs/operators'

import { TranslocoModule, TranslocoService } from '@ngneat/transloco'

import { ThemeService } from '@core/theme/theme.service'

import { FavoritesStore } from '@store/favorites.store'

import { ToastComponent } from '@shared/ui/toast/toast.component'

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslocoModule, ToastComponent],
  templateUrl: './app-shell.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppShellComponent implements OnInit {
  readonly themeService = inject(ThemeService)
  readonly favoritesStore = inject(FavoritesStore)
  private readonly router = inject(Router)
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID))
  private readonly transloco = inject(TranslocoService)

  readonly activeLang = toSignal(this.transloco.langChanges$, {
    initialValue: this.transloco.getActiveLang(),
  })
  protected readonly settingsOpen = signal(false)

  readonly navItems = [
    { path: '/', label: 'nav.home', icon: '🏠', exact: true },
    { path: '/search', label: 'nav.search', icon: '🔍', exact: false },
    { path: '/favorites', label: 'nav.favorites', icon: '♥', exact: false },
    { path: '/watchlist', label: 'nav.watchlist', icon: '📋', exact: false },
    { path: '/history', label: 'nav.history', icon: '📺', exact: false },
  ] as const

  protected readonly canInstall = signal(false)
  private deferredInstallPrompt: BeforeInstallPromptEvent | null = null

  ngOnInit(): void {
    // Move focus to main heading after each navigation for a11y.
    // Only triggers on path changes — not on query-param-only updates (e.g. search input),
    // which also fire NavigationEnd but must not steal focus from the active input.
    let previousPath: string | undefined = ''
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        const path = e.urlAfterRedirects.split('?')[0]
        if (path !== previousPath) {
          previousPath = path
          if (this.isBrowser) {
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }
          document.querySelector<HTMLElement>('#main-content h1')?.focus()
        }
      })

    // Capture PWA install prompt (Chrome/Edge only — iOS uses Safari share menu)
    if (this.isBrowser) {
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault()
        this.deferredInstallPrompt = e
        this.canInstall.set(true)
      })

      window.addEventListener('appinstalled', () => {
        this.deferredInstallPrompt = null
        this.canInstall.set(false)
      })
    }
  }

  protected async promptInstall(): Promise<void> {
    if (!this.deferredInstallPrompt) return
    const { outcome } = await this.deferredInstallPrompt.prompt()
    if (outcome === 'accepted') {
      this.deferredInstallPrompt = null
      this.canInstall.set(false)
    }
  }

  protected dismissInstall(): void {
    this.canInstall.set(false)
  }

  toggleLang(): void {
    this.transloco.setActiveLang(this.transloco.getActiveLang() === 'es' ? 'en' : 'es')
  }
}

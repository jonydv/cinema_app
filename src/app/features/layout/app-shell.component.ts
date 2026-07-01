import { isPlatformBrowser } from '@angular/common'
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  PLATFORM_ID,
  signal,
} from '@angular/core'
import { NavigationEnd, NavigationStart, Router, RouterOutlet } from '@angular/router'
import { RouterLink } from '@angular/router'

import { filter } from 'rxjs/operators'

import { TranslocoModule } from '@ngneat/transloco'

import { ThemeService } from '@core/theme/theme.service'

import { LogoComponent } from '@shared/ui/logo/logo.component'
import { ToastComponent } from '@shared/ui/toast/toast.component'

import { DesktopNavbarComponent } from './components/desktop-navbar.component'
import { MobileTabBarComponent } from './components/mobile-tab-bar.component'

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    TranslocoModule,
    ToastComponent,
    LogoComponent,
    DesktopNavbarComponent,
    MobileTabBarComponent,
  ],
  templateUrl: './app-shell.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppShellComponent implements OnInit {
  private readonly router = inject(Router)
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID))
  protected readonly themeService = inject(ThemeService)

  protected readonly currentYear = new Date().getFullYear()
  protected readonly canInstall = signal(false)
  private deferredInstallPrompt: BeforeInstallPromptEvent | null = null

  ngOnInit(): void {
    // Scroll to top before the View Transitions API captures state.
    // Must fire at NavigationStart — calling scrollTo at NavigationEnd is too late because
    // withViewTransitions() has already snapshotted the old scroll position by then.
    // Uses 'instant' to avoid a smooth-scroll animation fighting the view transition.
    this.router.events
      .pipe(filter((e): e is NavigationStart => e instanceof NavigationStart))
      .subscribe((e) => {
        if (!this.isBrowser) return
        const currentPath = this.router.url.split('?')[0]
        const nextPath = e.url.split('?')[0]
        if (nextPath !== currentPath) {
          window.scrollTo({ top: 0, behavior: 'instant' })
        }
      })

    // Move focus to main heading after navigation for a11y.
    // Only triggers on path changes — not on query-param-only updates (e.g. search input).
    let previousPath = ''
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        const path = (e.urlAfterRedirects ?? e.url).split('?')[0] ?? ''
        if (path !== previousPath) {
          previousPath = path
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
}

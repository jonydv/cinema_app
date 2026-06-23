import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core'
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router'

import { filter } from 'rxjs/operators'

import { TranslocoModule } from '@ngneat/transloco'

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

  readonly navItems = [
    { path: '/', label: 'nav.home', icon: '🏠', exact: true },
    { path: '/search', label: 'nav.search', icon: '🔍', exact: false },
    { path: '/favorites', label: 'nav.favorites', icon: '♥', exact: false },
  ] as const

  ngOnInit(): void {
    // Move focus to main heading after each navigation for a11y
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => {
        const heading = document.querySelector<HTMLElement>('#main-content h1')
        heading?.focus()
      })
  }
}

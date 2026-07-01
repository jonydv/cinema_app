import { ChangeDetectionStrategy, Component, inject } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { RouterLink, RouterLinkActive } from '@angular/router'

import { TranslocoModule, TranslocoService } from '@ngneat/transloco'

import { ThemeService } from '@core/theme/theme.service'

import { LogoComponent } from '@shared/ui/logo/logo.component'

import { NAV_ITEMS } from '../nav-items.constant'

@Component({
  selector: 'app-desktop-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TranslocoModule, LogoComponent],
  template: `
    <header
      class="hidden md:fixed md:left-0 md:right-0 md:top-0 md:z-30 md:flex md:h-16 md:items-center md:justify-between md:border-b md:border-(--color-border) md:bg-(--color-bg)/90 md:px-6 md:shadow-sm md:backdrop-blur-md"
    >
      <a
        routerLink="/"
        class="transition-opacity duration-200 md:hover:opacity-80"
        aria-label="CineScope — Inicio"
      >
        <app-logo [isDark]="themeService.theme() === 'dark'" />
      </a>

      <nav aria-label="Navegación principal">
        <ul class="flex items-center gap-1">
          @for (item of navItems; track item.path) {
            <li>
              <a
                [routerLink]="item.path"
                [routerLinkActiveOptions]="{ exact: item.exact }"
                routerLinkActive="text-(--color-primary) bg-(--color-surface)"
                class="rounded-lg px-3 py-1.5 text-sm font-medium text-(--color-text-secondary) transition-all duration-150 md:hover:bg-(--color-surface) md:hover:text-(--color-text-primary)"
              >
                {{ item.label | transloco }}
              </a>
            </li>
          }
        </ul>
      </nav>

      <div class="flex items-center gap-2">
        <!-- Language toggle -->
        <button
          type="button"
          class="flex h-9 items-center justify-center rounded-full px-2.5 text-xs font-semibold text-(--color-text-secondary) transition-all duration-150 md:hover:bg-(--color-surface) md:hover:text-(--color-text-primary)"
          [attr.aria-label]="'lang.select' | transloco"
          (click)="toggleLang()"
        >
          {{ activeLang() === 'es' ? '🇦🇷' : '🇺🇸' }} {{ 'lang.' + activeLang() | transloco }}
        </button>

        <!-- Theme toggle -->
        <button
          type="button"
          class="flex h-9 w-9 items-center justify-center rounded-full text-(--color-text-secondary) transition-all duration-150 md:hover:bg-(--color-surface) md:hover:text-(--color-text-primary)"
          [attr.aria-label]="'theme.toggle' | transloco"
          (click)="themeService.toggle()"
        >
          @if (themeService.theme() === 'dark') {
            <svg
              class="size-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z"
              />
            </svg>
          } @else {
            <svg
              class="size-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
          }
        </button>
      </div>
    </header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DesktopNavbarComponent {
  protected readonly themeService = inject(ThemeService)
  private readonly transloco = inject(TranslocoService)

  protected readonly navItems = NAV_ITEMS
  protected readonly activeLang = toSignal(this.transloco.langChanges$, {
    initialValue: this.transloco.getActiveLang(),
  })

  protected toggleLang(): void {
    this.transloco.setActiveLang(this.transloco.getActiveLang() === 'es' ? 'en' : 'es')
  }
}

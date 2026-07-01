import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { RouterLink, RouterLinkActive } from '@angular/router'

import { TranslocoModule, TranslocoService } from '@ngneat/transloco'

import { ThemeService } from '@core/theme/theme.service'

import { FavoritesStore } from '@store/favorites.store'

import { LogoComponent } from '@shared/ui/logo/logo.component'

import { NAV_ITEMS } from '../nav-items.constant'

@Component({
  selector: 'app-mobile-tab-bar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TranslocoModule, LogoComponent],
  template: `
    <!-- Bottom Tab Bar — mobile only -->
    <nav
      class="fixed bottom-0 left-0 right-0 z-30 flex h-16 items-center justify-around border-t border-(--color-border) bg-(--color-bg)/95 backdrop-blur-md md:hidden"
      aria-label="Navegación principal"
    >
      @for (item of navItems; track item.path) {
        <a
          [routerLink]="item.path"
          [routerLinkActiveOptions]="{ exact: item.exact }"
          routerLinkActive="text-(--color-primary)"
          class="relative flex min-h-[48px] min-w-[56px] flex-col items-center justify-center gap-0.5 text-[10px] font-medium text-(--color-text-secondary)"
        >
          <span class="text-xl leading-none" aria-hidden="true">{{ item.icon }}</span>
          <span>{{ item.label | transloco }}</span>

          @if (item.path === '/favorites' && favoritesStore.count() > 0) {
            <span
              class="absolute right-2 top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-(--color-primary) px-1 text-[9px] font-bold text-white"
              aria-hidden="true"
            >
              {{ favoritesStore.count() > 99 ? '99+' : favoritesStore.count() }}
            </span>
          }
        </a>
      }

      <!-- Settings button -->
      <button
        type="button"
        class="flex min-h-[48px] min-w-[56px] flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors duration-150"
        [class]="settingsOpen() ? 'text-(--color-primary)' : 'text-(--color-text-secondary)'"
        [attr.aria-label]="'nav.settings' | transloco"
        [attr.aria-expanded]="settingsOpen()"
        (click)="settingsOpen.set(!settingsOpen())"
      >
        <span class="text-xl leading-none" aria-hidden="true">⚙️</span>
        <span>{{ 'nav.settings' | transloco }}</span>
      </button>
    </nav>

    <!-- Settings panel — mobile only -->
    @if (settingsOpen()) {
      <div
        class="fixed inset-0 z-20 md:hidden"
        aria-hidden="true"
        (click)="settingsOpen.set(false)"
      ></div>
      <div
        class="fixed bottom-18 right-3 z-30 min-w-[200px] rounded-2xl bg-(--color-surface) p-2 shadow-xl ring-1 ring-black/10 md:hidden dark:ring-white/10"
        role="menu"
      >
        <button
          type="button"
          role="menuitem"
          class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-(--color-text-primary) transition-colors active:bg-(--color-surface-2)"
          (click)="toggleLang(); settingsOpen.set(false)"
        >
          <span class="text-lg" aria-hidden="true">{{ activeLang() === 'es' ? '🇦🇷' : '🇺🇸' }}</span>
          <span class="flex-1 font-medium">{{ 'lang.' + activeLang() | transloco }}</span>
          <span
            class="rounded-md bg-(--color-surface-2) px-1.5 py-0.5 text-[11px] font-semibold uppercase text-(--color-text-secondary)"
            >{{ activeLang() === 'es' ? 'EN' : 'ES' }}</span
          >
        </button>
        <div class="my-1 h-px bg-(--color-border)"></div>
        <button
          type="button"
          role="menuitem"
          class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-(--color-text-primary) transition-colors active:bg-(--color-surface-2)"
          (click)="themeService.toggle(); settingsOpen.set(false)"
        >
          <span class="text-lg" aria-hidden="true">{{
            themeService.theme() === 'dark' ? '☀️' : '🌙'
          }}</span>
          <span class="flex-1 font-medium">{{ 'theme.toggle' | transloco }}</span>
        </button>
        <div class="my-1 h-px bg-(--color-border)"></div>
        <a
          href="https://www.jonatandvillalbaweb.com.ar/"
          target="_blank"
          rel="noopener noreferrer"
          role="menuitem"
          class="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-xs text-(--color-text-secondary) transition-colors active:bg-(--color-surface-2)"
          (click)="settingsOpen.set(false)"
        >
          <app-logo
            [iconOnly]="true"
            [isDark]="themeService.theme() === 'dark'"
            [size]="18"
            aria-hidden="true"
          />
          <span>© {{ currentYear }} · Jonatan Villalba</span>
        </a>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobileTabBarComponent {
  protected readonly themeService = inject(ThemeService)
  protected readonly favoritesStore = inject(FavoritesStore)
  private readonly transloco = inject(TranslocoService)

  protected readonly navItems = NAV_ITEMS
  protected readonly currentYear = new Date().getFullYear()
  protected readonly settingsOpen = signal(false)
  protected readonly activeLang = toSignal(this.transloco.langChanges$, {
    initialValue: this.transloco.getActiveLang(),
  })

  protected toggleLang(): void {
    this.transloco.setActiveLang(this.transloco.getActiveLang() === 'es' ? 'en' : 'es')
  }
}

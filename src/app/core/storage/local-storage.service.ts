import { isPlatformBrowser } from '@angular/common'
import { inject, Injectable, PLATFORM_ID } from '@angular/core'

/**
 * SSR-safe wrapper around window.localStorage.
 * During server-side rendering, localStorage does not exist — all reads return null silently.
 */
@Injectable({ providedIn: 'root' })
export class LocalStorageService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID))

  get<T>(key: string): T | null {
    if (!this.isBrowser) return null
    try {
      const raw = window.localStorage.getItem(key)
      return raw ? (JSON.parse(raw) as T) : null
    } catch {
      return null
    }
  }

  set<T>(key: string, value: T): void {
    if (!this.isBrowser) return
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Storage quota exceeded or private browsing — fail silently
    }
  }

  remove(key: string): void {
    if (!this.isBrowser) return
    window.localStorage.removeItem(key)
  }
}

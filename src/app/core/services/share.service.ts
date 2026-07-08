import { Injectable } from '@angular/core'

import { isBrowser } from '@core/utils/platform'

import { MovieDetail } from '@data/models/movie.model'

@Injectable({ providedIn: 'root' })
export class ShareService {
  private readonly _isBrowser = isBrowser()

  async nativeShare(movie: MovieDetail): Promise<'shared' | 'cancelled' | 'unsupported'> {
    if (!this._isBrowser || !navigator.share) return 'unsupported'
    const url = `${window.location.origin}/movie/${movie.id}`
    try {
      await navigator.share({
        title: movie.title,
        text: `Te recomiendo ver "${movie.title}" en CineScope`,
        url,
      })
      return 'shared'
    } catch {
      return 'cancelled'
    }
  }

  whatsAppUrl(movie: MovieDetail): string {
    const url = this._isBrowser
      ? `${window.location.origin}/movie/${movie.id}`
      : `/movie/${movie.id}`
    return `https://wa.me/?text=${encodeURIComponent(`"${movie.title}" en CineScope: ${url}`)}`
  }

  mailUrl(movie: MovieDetail): string {
    const url = this._isBrowser
      ? `${window.location.origin}/movie/${movie.id}`
      : `/movie/${movie.id}`
    const subject = encodeURIComponent(`Te recomiendo: ${movie.title}`)
    const body = encodeURIComponent(`${movie.title}\n${url}`)
    return `mailto:?subject=${subject}&body=${body}`
  }

  async copyLink(movieId: number): Promise<boolean> {
    if (!this._isBrowser) return false
    const url = `${window.location.origin}/movie/${movieId}`
    try {
      await navigator.clipboard.writeText(url)
      return true
    } catch {
      return false
    }
  }
}

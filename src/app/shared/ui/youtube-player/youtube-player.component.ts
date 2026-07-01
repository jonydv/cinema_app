import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core'
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'

import { TranslocoModule } from '@ngneat/transloco'

import { isBrowser } from '@core/utils/platform'

@Component({
  selector: 'app-youtube-player',
  standalone: true,
  imports: [TranslocoModule],
  templateUrl: './youtube-player.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class YoutubePlayerComponent {
  readonly videoKey = input<string | null>(null)

  protected readonly playing = signal(false)
  protected readonly isBrowser = isBrowser()

  private readonly sanitizer = inject(DomSanitizer)

  protected readonly embedUrl = computed((): SafeResourceUrl | null => {
    const key = this.videoKey()
    if (!key) return null
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube.com/embed/${key}?enablejsapi=1&rel=0&autoplay=1`,
    )
  })

  protected readonly thumbnailUrl = computed((): string | null => {
    const key = this.videoKey()
    return key ? `https://img.youtube.com/vi/${key}/maxresdefault.jpg` : null
  })

  protected play(): void {
    this.playing.set(true)
  }
}

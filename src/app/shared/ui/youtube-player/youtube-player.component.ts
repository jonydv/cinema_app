import { isPlatformBrowser } from '@angular/common'
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  PLATFORM_ID,
  signal,
} from '@angular/core'
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'

import { TranslocoModule } from '@ngneat/transloco'

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
  protected readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID))

  private readonly sanitizer = inject(DomSanitizer)

  protected readonly embedUrl = computed((): SafeResourceUrl | null => {
    const key = this.videoKey()
    if (!key) return null
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube.com/embed/${key}?enablejsapi=1&rel=0`,
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

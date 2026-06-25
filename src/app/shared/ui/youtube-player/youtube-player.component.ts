import { isPlatformBrowser } from '@angular/common'
import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  input,
  OnInit,
  PLATFORM_ID,
} from '@angular/core'

import { TranslocoModule } from '@ngneat/transloco'

@Component({
  selector: 'app-youtube-player',
  standalone: true,
  imports: [TranslocoModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './youtube-player.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class YoutubePlayerComponent implements OnInit {
  readonly videoKey = input<string | null>(null)

  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID))

  ngOnInit(): void {
    if (this.isBrowser) {
      import('lite-youtube-embed')
    }
  }
}

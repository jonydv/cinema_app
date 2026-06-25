import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  input,
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
export class YoutubePlayerComponent {
  readonly videoKey = input<string | null>(null)

  constructor() {
    // afterNextRender runs only in the browser, after the first render+hydration cycle,
    // guaranteeing the custom element is registered before Angular tries to use it.
    afterNextRender(() => {
      import('lite-youtube-embed')
    })
  }
}

import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  input,
  OnInit,
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

  ngOnInit(): void {
    // Dynamically import the custom element — avoids SSR issues
    if (typeof window !== 'undefined') {
      import('lite-youtube-embed')
    }
  }
}

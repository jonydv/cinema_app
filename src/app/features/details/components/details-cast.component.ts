import { ChangeDetectionStrategy, Component, input } from '@angular/core'

import { TranslocoModule } from '@ngneat/transloco'

import { Actor } from '@data/models/movie.model'

@Component({
  selector: 'app-details-cast',
  standalone: true,
  imports: [TranslocoModule],
  templateUrl: './details-cast.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailsCastComponent {
  readonly cast = input.required<Actor[]>()
}

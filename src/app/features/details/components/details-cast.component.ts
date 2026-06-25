import { ChangeDetectionStrategy, Component, input } from '@angular/core'
import { RouterLink } from '@angular/router'

import { TranslocoModule } from '@ngneat/transloco'

import { Actor } from '@data/models/movie.model'

import { CarouselComponent } from '@shared/ui/carousel/carousel.component'

@Component({
  selector: 'app-details-cast',
  standalone: true,
  imports: [TranslocoModule, RouterLink, CarouselComponent],
  templateUrl: './details-cast.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailsCastComponent {
  readonly cast = input.required<Actor[]>()
}

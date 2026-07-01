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

  protected initials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean)
    const first = parts.at(0)?.[0] ?? ''
    const last = parts.length > 1 ? (parts.at(-1)?.[0] ?? '') : ''
    return (first + last).toUpperCase() || '?'
  }
}

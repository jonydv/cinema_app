import { NgOptimizedImage } from '@angular/common'
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core'
import { RouterLink } from '@angular/router'

import { TranslocoModule } from '@ngneat/transloco'

import { Movie } from '@data/models/movie.model'

@Component({
  selector: 'app-movie-card',
  standalone: true,
  imports: [NgOptimizedImage, RouterLink, TranslocoModule],
  templateUrl: './movie-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieCardComponent {
  readonly movie = input.required<Movie>()
  readonly isFavorite = input<boolean>(false)
  readonly favoriteToggled = output<Movie>()

  onFavoriteClick(event: Event): void {
    event.preventDefault()
    event.stopPropagation()
    this.favoriteToggled.emit(this.movie())
  }
}

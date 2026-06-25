import { ChangeDetectionStrategy, Component, input, output } from '@angular/core'
import { RouterLink } from '@angular/router'

import { TranslocoModule } from '@ngneat/transloco'

import { Movie } from '@data/models/movie.model'

@Component({
  selector: 'app-movie-card',
  standalone: true,
  imports: [RouterLink, TranslocoModule],
  templateUrl: './movie-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieCardComponent {
  readonly movie = input.required<Movie>()
  readonly isFavorite = input<boolean>(false)
  readonly isInWatchlist = input<boolean>(false)
  readonly isWatched = input<boolean>(false)
  readonly favoriteToggled = output<Movie>()
  readonly watchlistToggled = output<Movie>()
  readonly watchedToggled = output<Movie>()

  onFavoriteClick(event: Event): void {
    event.preventDefault()
    event.stopPropagation()
    this.favoriteToggled.emit(this.movie())
  }

  onWatchlistClick(event: Event): void {
    event.preventDefault()
    event.stopPropagation()
    this.watchlistToggled.emit(this.movie())
  }

  onWatchedClick(event: Event): void {
    event.preventDefault()
    event.stopPropagation()
    this.watchedToggled.emit(this.movie())
  }
}

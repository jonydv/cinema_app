import { ChangeDetectionStrategy, Component, input, output } from '@angular/core'
import { RouterLink } from '@angular/router'

import { TranslocoModule } from '@ngneat/transloco'

import { Movie } from '@data/models/movie.model'

import { IconActionButtonComponent } from '@shared/ui/icon-action-button/icon-action-button.component'

@Component({
  selector: 'app-movie-card',
  standalone: true,
  imports: [RouterLink, TranslocoModule, IconActionButtonComponent],
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

  formatVoteCount(count: number): string {
    if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`
    if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`
    return String(count)
  }

  onFavoriteClick(): void {
    this.favoriteToggled.emit(this.movie())
  }

  onWatchlistClick(): void {
    this.watchlistToggled.emit(this.movie())
  }

  onWatchedClick(): void {
    this.watchedToggled.emit(this.movie())
  }
}

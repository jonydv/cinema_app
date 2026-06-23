import { ChangeDetectionStrategy, Component, input, output } from '@angular/core'

import { TranslocoModule } from '@ngneat/transloco'

import { Movie, MovieDetail } from '@data/models/movie.model'

@Component({
  selector: 'app-details-backdrop',
  standalone: true,
  imports: [TranslocoModule],
  templateUrl: './details-backdrop.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailsBackdropComponent {
  readonly movie = input.required<MovieDetail>()
  readonly isFavorite = input<boolean>(false)
  readonly favoriteToggled = output<Movie>()

  protected ratingDisplay(): string {
    return this.movie().rating.toFixed(1)
  }

  onFavoriteClick(): void {
    this.favoriteToggled.emit(this.movie())
  }
}

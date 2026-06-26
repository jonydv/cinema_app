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
  readonly genreClicked = output<number>()

  protected ratingDisplay(): string {
    return this.movie().rating.toFixed(1)
  }

  protected genreEntries(): { name: string; id: number }[] {
    const m = this.movie()
    return m.genres.map((name, i) => ({ name, id: m.genreIds[i] ?? 0 }))
  }

  onFavoriteClick(): void {
    this.favoriteToggled.emit(this.movie())
  }
}

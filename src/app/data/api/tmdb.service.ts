import { HttpClient } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'

import { forkJoin, map, Observable } from 'rxjs'

import { adaptMovie, adaptMovieDetail } from '@data/api/adapters/movie.adapter'
import {
  TmdbCreditsDto,
  TmdbMovieDetailDto,
  TmdbMovieDto,
  TmdbPagedResponseDto,
  TmdbVideosDto,
} from '@data/api/dtos/tmdb-movie.dto'
import { Actor, MovieDetail, PagedMovies } from '@data/models/movie.model'

import { environment } from '@env/environment'

@Injectable({ providedIn: 'root' })
export class TmdbService {
  private readonly http = inject(HttpClient)
  private readonly base = environment.tmdbApiUrl

  getPopularMovies(page = 1): Observable<PagedMovies> {
    return this.http
      .get<TmdbPagedResponseDto<TmdbMovieDto>>(`${this.base}/movie/popular`, {
        params: { page: String(page) },
      })
      .pipe(
        map((res) => ({
          movies: res.results.map(adaptMovie),
          totalPages: res.total_pages,
          totalResults: res.total_results,
        })),
      )
  }

  getMovieDetails(id: number): Observable<MovieDetail> {
    return forkJoin({
      detail: this.http.get<TmdbMovieDetailDto>(`${this.base}/movie/${id}`),
      videos: this.http.get<TmdbVideosDto>(`${this.base}/movie/${id}/videos`),
      credits: this.http.get<TmdbCreditsDto>(`${this.base}/movie/${id}/credits`),
    }).pipe(
      map(({ detail, videos, credits }) => adaptMovieDetail(detail, videos.results, credits.cast)),
    )
  }

  searchMovies(query: string, page = 1): Observable<PagedMovies> {
    return this.http
      .get<TmdbPagedResponseDto<TmdbMovieDto>>(`${this.base}/search/movie`, {
        params: { query, page: String(page), include_adult: 'false' },
      })
      .pipe(
        map((res) => ({
          movies: res.results.map(adaptMovie),
          totalPages: res.total_pages,
          totalResults: res.total_results,
        })),
      )
  }

  getMovieCredits(id: number): Observable<Actor[]> {
    return this.http.get<TmdbCreditsDto>(`${this.base}/movie/${id}/credits`).pipe(
      map((res) =>
        res.cast.slice(0, 15).map((c) => ({
          id: c.id,
          name: c.name,
          character: c.character,
          profileUrl: c.profile_path
            ? `${environment.tmdbImageBaseUrl}/w185${c.profile_path}`
            : '/assets/images/no-profile.svg',
        })),
      ),
    )
  }
}

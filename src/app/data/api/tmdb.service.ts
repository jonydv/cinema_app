import { HttpClient } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'

import { forkJoin, map, Observable } from 'rxjs'

import { TranslocoService } from '@ngneat/transloco'

import {
  adaptMovie,
  adaptMovieDetail,
  adaptPerson,
  adaptWatchProviders,
} from '@data/api/adapters/movie.adapter'
import {
  TmdbCreditsDto,
  TmdbMovieDetailDto,
  TmdbMovieDto,
  TmdbPagedResponseDto,
  TmdbPersonCreditsDto,
  TmdbPersonDto,
  TmdbVideosDto,
  TmdbWatchProvidersResponseDto,
} from '@data/api/dtos/tmdb-movie.dto'
import {
  Actor,
  MovieDetail,
  PagedMovies,
  PersonDetail,
  WatchProvider,
} from '@data/models/movie.model'

import { environment } from '@env/environment'

interface TmdbGenreListDto {
  genres: { id: number; name: string }[]
}

const LANG_MAP: Record<string, string> = {
  es: 'es-ES',
  en: 'en-US',
}

@Injectable({ providedIn: 'root' })
export class TmdbService {
  private readonly http = inject(HttpClient)
  private readonly base = environment.tmdbApiUrl
  private readonly transloco = inject(TranslocoService)

  private get lang(): string {
    return LANG_MAP[this.transloco.getActiveLang()] ?? 'en-US'
  }

  getPopularMovies(page = 1): Observable<PagedMovies> {
    return this.http
      .get<TmdbPagedResponseDto<TmdbMovieDto>>(`${this.base}/movie/popular`, {
        params: { page: String(page), language: this.lang },
      })
      .pipe(
        map((res) => ({
          movies: res.results.map(adaptMovie),
          totalPages: res.total_pages,
          totalResults: res.total_results,
        })),
      )
  }

  getDiscoverMovies(
    page = 1,
    genreId: number | null = null,
    sortBy = 'popularity.desc',
    year: number | null = null,
    minRating = 0,
    minRuntime: number | null = null,
    maxRuntime: number | null = null,
  ): Observable<PagedMovies> {
    const params: Record<string, string> = {
      page: String(page),
      sort_by: sortBy,
      include_adult: 'false',
      language: this.lang,
    }
    if (genreId !== null) params['with_genres'] = String(genreId)
    if (year !== null) params['primary_release_year'] = String(year)
    if (minRating > 0) {
      params['vote_average.gte'] = String(minRating)
      params['vote_count.gte'] = '100'
    }
    if (minRuntime !== null) params['with_runtime.gte'] = String(minRuntime)
    if (maxRuntime !== null) params['with_runtime.lte'] = String(maxRuntime)

    return this.http
      .get<TmdbPagedResponseDto<TmdbMovieDto>>(`${this.base}/discover/movie`, { params })
      .pipe(
        map((res) => ({
          movies: res.results.map(adaptMovie),
          totalPages: res.total_pages,
          totalResults: res.total_results,
        })),
      )
  }

  getNowPlaying(page = 1): Observable<PagedMovies> {
    return this.http
      .get<TmdbPagedResponseDto<TmdbMovieDto>>(`${this.base}/movie/now_playing`, {
        params: { page: String(page), language: this.lang },
      })
      .pipe(
        map((res) => ({
          movies: res.results.map(adaptMovie),
          totalPages: res.total_pages,
          totalResults: res.total_results,
        })),
      )
  }

  getTopRated(page = 1): Observable<PagedMovies> {
    return this.http
      .get<TmdbPagedResponseDto<TmdbMovieDto>>(`${this.base}/movie/top_rated`, {
        params: { page: String(page), language: this.lang },
      })
      .pipe(
        map((res) => ({
          movies: res.results.map(adaptMovie),
          totalPages: res.total_pages,
          totalResults: res.total_results,
        })),
      )
  }

  getUpcoming(page = 1): Observable<PagedMovies> {
    return this.http
      .get<TmdbPagedResponseDto<TmdbMovieDto>>(`${this.base}/movie/upcoming`, {
        params: { page: String(page), language: this.lang },
      })
      .pipe(
        map((res) => ({
          movies: res.results.map(adaptMovie),
          totalPages: res.total_pages,
          totalResults: res.total_results,
        })),
      )
  }

  getGenres(): Observable<{ id: number; name: string }[]> {
    return this.http
      .get<TmdbGenreListDto>(`${this.base}/genre/movie/list`, {
        params: { language: this.lang },
      })
      .pipe(map((res) => res.genres))
  }

  getMovieDetails(id: number): Observable<MovieDetail> {
    const lang = this.lang
    return forkJoin({
      detail: this.http.get<TmdbMovieDetailDto>(`${this.base}/movie/${id}`, {
        params: { language: lang },
      }),
      // Videos and credits are language-neutral — trailer keys and actor names don't change
      videos: this.http.get<TmdbVideosDto>(`${this.base}/movie/${id}/videos`),
      credits: this.http.get<TmdbCreditsDto>(`${this.base}/movie/${id}/credits`),
    }).pipe(
      map(({ detail, videos, credits }) => adaptMovieDetail(detail, videos.results, credits.cast)),
    )
  }

  searchMovies(query: string, page = 1): Observable<PagedMovies> {
    return this.http
      .get<TmdbPagedResponseDto<TmdbMovieDto>>(`${this.base}/search/movie`, {
        params: { query, page: String(page), include_adult: 'false', language: this.lang },
      })
      .pipe(
        map((res) => ({
          movies: res.results.map(adaptMovie),
          totalPages: res.total_pages,
          totalResults: res.total_results,
        })),
      )
  }

  getTrending(page = 1): Observable<PagedMovies> {
    return this.http
      .get<TmdbPagedResponseDto<TmdbMovieDto>>(`${this.base}/trending/movie/week`, {
        params: { page: String(page), language: this.lang },
      })
      .pipe(
        map((res) => ({
          movies: res.results.map(adaptMovie),
          totalPages: res.total_pages,
          totalResults: res.total_results,
        })),
      )
  }

  getRecommendations(id: number, page = 1): Observable<PagedMovies> {
    return this.http
      .get<TmdbPagedResponseDto<TmdbMovieDto>>(`${this.base}/movie/${id}/recommendations`, {
        params: { page: String(page), language: this.lang },
      })
      .pipe(
        map((res) => ({
          movies: res.results.map(adaptMovie),
          totalPages: res.total_pages,
          totalResults: res.total_results,
        })),
      )
  }

  getWatchProviders(id: number, countryCode = 'US'): Observable<WatchProvider[]> {
    return this.http
      .get<TmdbWatchProvidersResponseDto>(`${this.base}/movie/${id}/watch/providers`)
      .pipe(map((res) => adaptWatchProviders(res, countryCode)))
  }

  getPersonDetails(id: number): Observable<PersonDetail> {
    const lang = this.lang
    return forkJoin({
      person: this.http.get<TmdbPersonDto>(`${this.base}/person/${id}`, {
        params: { language: lang },
      }),
      credits: this.http.get<TmdbPersonCreditsDto>(`${this.base}/person/${id}/movie_credits`, {
        params: { language: lang },
      }),
    }).pipe(map(({ person, credits }) => adaptPerson(person, credits.cast)))
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

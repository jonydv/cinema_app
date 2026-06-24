import { TestBed } from '@angular/core/testing'

import { vi } from 'vitest'

import { LocalStorageService } from '@core/storage/local-storage.service'

import { Movie } from '@data/models/movie.model'

import { FavoritesStore } from './favorites.store'

const mockMovie = (id: number): Movie => ({
  id,
  title: `Movie ${id}`,
  overview: 'An overview',
  posterUrl: '/poster.jpg',
  backdropUrl: '/backdrop.jpg',
  rating: 7.5,
  voteCount: 100,
  releaseDate: '2024-01-01',
  releaseYear: 2024,
  genreIds: [28],
  popularity: 100,
})

describe('FavoritesStore', () => {
  let store: InstanceType<typeof FavoritesStore>
  const storageSpy = {
    get: vi.fn(() => null),
    set: vi.fn(),
    remove: vi.fn(),
  }

  beforeEach(() => {
    storageSpy.get.mockReturnValue(null)
    storageSpy.set.mockClear()

    TestBed.configureTestingModule({
      providers: [FavoritesStore, { provide: LocalStorageService, useValue: storageSpy }],
    })
    store = TestBed.inject(FavoritesStore)
  })

  afterEach(() => TestBed.resetTestingModule())

  it('initialises with an empty favorites list', () => {
    expect(store.favorites()).toEqual([])
    expect(store.count()).toBe(0)
  })

  it('adds a movie when toggleFavorite is called for a new movie', () => {
    store.toggleFavorite(mockMovie(1))
    expect(store.favorites()).toHaveLength(1)
    expect(store.favorites()[0]?.id).toBe(1)
  })

  it('removes a movie when toggleFavorite is called for an existing movie', () => {
    store.toggleFavorite(mockMovie(1))
    store.toggleFavorite(mockMovie(1))
    expect(store.favorites()).toHaveLength(0)
  })

  it('isFavorite returns true after adding a movie', () => {
    store.toggleFavorite(mockMovie(1))
    expect(store.isFavorite(1)).toBe(true)
  })

  it('isFavorite returns false for a movie that was not added', () => {
    expect(store.isFavorite(99)).toBe(false)
  })

  it('count reflects the number of favorites', () => {
    store.toggleFavorite(mockMovie(1))
    store.toggleFavorite(mockMovie(2))
    expect(store.count()).toBe(2)
  })

  it('clearAll empties the favorites list', () => {
    store.toggleFavorite(mockMovie(1))
    store.toggleFavorite(mockMovie(2))
    store.clearAll()
    expect(store.favorites()).toEqual([])
    expect(store.count()).toBe(0)
  })

  it('rehydrates from localStorage on init when saved data exists', () => {
    const saved = [mockMovie(5)]
    storageSpy.get.mockReturnValue(saved)

    TestBed.resetTestingModule()
    TestBed.configureTestingModule({
      providers: [FavoritesStore, { provide: LocalStorageService, useValue: storageSpy }],
    })
    const hydratedStore = TestBed.inject(FavoritesStore)

    expect(hydratedStore.favorites()).toHaveLength(1)
    expect(hydratedStore.favorites()[0]?.id).toBe(5)
  })
})

import { TestBed } from '@angular/core/testing'

import { vi } from 'vitest'

import { LocalStorageService } from '@core/storage/local-storage.service'

import { Movie } from '@data/models/movie.model'

import { WatchedStore } from './watched.store'

const mockMovie = (id: number): Movie => ({
  id,
  title: `Movie ${id}`,
  overview: '',
  posterUrl: '/poster.jpg',
  backdropUrl: '',
  rating: 7.5,
  voteCount: 100,
  releaseDate: '2024-01-01',
  releaseYear: 2024,
  genreIds: [28],
  popularity: 100,
})

describe('WatchedStore', () => {
  let store: InstanceType<typeof WatchedStore>
  const storageSpy = { get: vi.fn(() => null), set: vi.fn(), remove: vi.fn() }

  beforeEach(() => {
    storageSpy.get.mockReturnValue(null)
    storageSpy.set.mockClear()
    TestBed.configureTestingModule({
      providers: [WatchedStore, { provide: LocalStorageService, useValue: storageSpy }],
    })
    store = TestBed.inject(WatchedStore)
  })

  afterEach(() => TestBed.resetTestingModule())

  it('initialises with empty watched record', () => {
    expect(store.watchedCount()).toBe(0)
    expect(store.watchedList()).toHaveLength(0)
  })

  it('markWatched adds an entry with current date', () => {
    const before = new Date()
    store.markWatched(mockMovie(1))
    const after = new Date()

    expect(store.watchedCount()).toBe(1)
    expect(store.isWatched(1)).toBe(true)

    const entry = store.watchedList()[0]!
    const entryDate = new Date(entry.date)
    expect(entryDate >= before).toBe(true)
    expect(entryDate <= after).toBe(true)
    expect(entry.title).toBe('Movie 1')
    expect(entry.posterUrl).toBe('/poster.jpg')
    expect(entry.rating).toBe(7.5)
  })

  it('markUnwatched removes an entry', () => {
    store.markWatched(mockMovie(1))
    store.markUnwatched(1)
    expect(store.watchedCount()).toBe(0)
    expect(store.isWatched(1)).toBe(false)
  })

  it('isWatched returns false for unknown movie', () => {
    expect(store.isWatched(99)).toBe(false)
  })

  it('clearAll removes all entries', () => {
    store.markWatched(mockMovie(1))
    store.markWatched(mockMovie(2))
    store.clearAll()
    expect(store.watchedCount()).toBe(0)
  })

  it('rehydrates from localStorage on init', () => {
    const saved = {
      5: { date: '2024-05-01T10:00:00Z', title: 'Old Movie', posterUrl: '/p.jpg', rating: 8 },
    }
    storageSpy.get.mockReturnValue(saved)

    TestBed.resetTestingModule()
    TestBed.configureTestingModule({
      providers: [WatchedStore, { provide: LocalStorageService, useValue: storageSpy }],
    })
    const hydratedStore = TestBed.inject(WatchedStore)

    expect(hydratedStore.watchedCount()).toBe(1)
    expect(hydratedStore.isWatched(5)).toBe(true)
  })
})

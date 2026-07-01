import { vi } from 'vitest'

import { MovieCardComponent } from './movie-card.component'

// Note: signal-input rendering tests (setInput) require the Angular CLI runner
// (ng test) or @analogjs/vite-plugin-angular for full AOT compilation in vitest.

describe('MovieCardComponent', () => {
  it('exports the component class', () => {
    expect(MovieCardComponent).toBeDefined()
    expect(typeof MovieCardComponent).toBe('function')
  })
})

describe('MovieCardComponent.onFavoriteClick', () => {
  it('emits the current movie when clicked', () => {
    const instance = Object.create(MovieCardComponent.prototype) as MovieCardComponent
    const emitSpy = vi.fn()
    const fakeMovie = { id: 1, title: 'Test' }

    ;(instance as { favoriteToggled: { emit: (m: unknown) => void } }).favoriteToggled = {
      emit: emitSpy,
    }
    ;(instance as { movie: () => typeof fakeMovie }).movie = () => fakeMovie

    instance.onFavoriteClick()

    expect(emitSpy).toHaveBeenCalledWith(fakeMovie)
  })
})

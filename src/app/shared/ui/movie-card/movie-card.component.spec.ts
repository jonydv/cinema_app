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
  it('calls preventDefault and stopPropagation on the event', () => {
    const instance = Object.create(MovieCardComponent.prototype) as MovieCardComponent
    const fakeEvent = new MouseEvent('click', { bubbles: true, cancelable: true })
    const preventSpy = vi.spyOn(fakeEvent, 'preventDefault')
    const stopSpy = vi.spyOn(fakeEvent, 'stopPropagation')

    // Stub the signal output and input so we can call the method in isolation
    ;(instance as { favoriteToggled: { emit: () => void } }).favoriteToggled = { emit: vi.fn() }
    ;(instance as { movie: () => null }).movie = () => null

    instance.onFavoriteClick(fakeEvent)

    expect(preventSpy).toHaveBeenCalled()
    expect(stopSpy).toHaveBeenCalled()
  })

  it('emits the current movie when clicked', () => {
    const instance = Object.create(MovieCardComponent.prototype) as MovieCardComponent
    const emitSpy = vi.fn()
    const fakeMovie = { id: 1, title: 'Test' }

    ;(instance as { favoriteToggled: { emit: (m: unknown) => void } }).favoriteToggled = {
      emit: emitSpy,
    }
    ;(instance as { movie: () => typeof fakeMovie }).movie = () => fakeMovie

    instance.onFavoriteClick(new MouseEvent('click'))

    expect(emitSpy).toHaveBeenCalledWith(fakeMovie)
  })
})

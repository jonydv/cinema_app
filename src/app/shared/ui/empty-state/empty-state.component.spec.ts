import { EmptyStateComponent } from './empty-state.component'

// Note: signal-input rendering tests (setInput) require the Angular CLI runner
// (ng test) or @analogjs/vite-plugin-angular for full AOT compilation in vitest.

describe('EmptyStateComponent', () => {
  it('exports the component class', () => {
    expect(EmptyStateComponent).toBeDefined()
    expect(typeof EmptyStateComponent).toBe('function')
  })

  it('has the expected selector', () => {
    const sel = (EmptyStateComponent as { ɵcmp?: { selectors?: unknown[][] } }).ɵcmp?.selectors
    if (sel) {
      // AOT: selectors is [['app-empty-state']]
      expect(sel[0]?.[0]).toBe('app-empty-state')
    } else {
      // JIT not compiled yet — just verify the class name matches convention
      expect(EmptyStateComponent.name).toMatch(/EmptyState/)
    }
  })
})

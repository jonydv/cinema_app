import { Directive, ElementRef, HostListener, inject, signal } from '@angular/core'

/**
 * Mouse drag-to-scroll for horizontal overflow containers.
 * Touch users scroll natively — this only activates on mouse pointer events.
 * Uses capture-phase click to cancel RouterLink navigation after a real drag (≥ 5 px).
 * document:mousemove / document:mouseup keep the drag alive when the pointer
 * leaves the element boundary, preventing the erratic "freeze" behaviour.
 */
@Directive({
  selector: '[appDragScroll]',
  standalone: true,
  host: {
    '[class.cursor-grab]': '!isDragging()',
    '[class.cursor-grabbing]': 'isDragging()',
    '[class.select-none]': 'isDragging()',
  },
})
export class DragScrollDirective {
  private readonly el = inject(ElementRef<HTMLElement>)

  protected readonly isDragging = signal(false)
  private startX = 0
  private scrollLeft = 0
  private didDrag = false

  constructor() {
    this.el.nativeElement.addEventListener(
      'click',
      (e: MouseEvent) => {
        if (this.didDrag) {
          e.preventDefault()
          e.stopPropagation()
          this.didDrag = false
        }
      },
      true, // capture phase — fires before child RouterLink / anchor handles click
    )
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(e: MouseEvent): void {
    if (e.button !== 0) return
    this.isDragging.set(true)
    this.didDrag = false
    this.startX = e.clientX
    this.scrollLeft = this.el.nativeElement.scrollLeft
  }

  // document-level listeners keep drag alive when pointer leaves the element
  @HostListener('document:mousemove', ['$event'])
  onMouseMove(e: MouseEvent): void {
    if (!this.isDragging()) return
    const walk = e.clientX - this.startX // positive → moved right → scroll left
    if (Math.abs(walk) > 5) {
      this.didDrag = true
      this.el.nativeElement.scrollLeft = this.scrollLeft - walk
    }
  }

  @HostListener('document:mouseup')
  onMouseUp(): void {
    this.isDragging.set(false)
  }
}

import { isPlatformBrowser } from '@angular/common'
import {
  Directive,
  ElementRef,
  inject,
  input,
  OnDestroy,
  OnInit,
  output,
  PLATFORM_ID,
} from '@angular/core'

@Directive({
  selector: '[appInfiniteScroll]',
  standalone: true,
})
export class InfiniteScrollDirective implements OnInit, OnDestroy {
  /** Minimum intersection ratio (0–1) before the event fires. */
  readonly threshold = input<number>(0.1)
  /** Fires when the sentinel element enters the viewport. */
  readonly scrolled = output<void>()

  private observer: IntersectionObserver | null = null
  private readonly el = inject(ElementRef<HTMLElement>)
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID))

  ngOnInit(): void {
    if (!this.isBrowser) return
    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          this.scrolled.emit()
        }
      },
      { threshold: this.threshold() },
    )
    this.observer.observe(this.el.nativeElement)
  }

  ngOnDestroy(): void {
    this.observer?.disconnect()
  }
}

import { isPlatformBrowser } from '@angular/common'
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  PLATFORM_ID,
  ViewChild,
  inject,
  input,
  signal,
} from '@angular/core'

import { DragScrollDirective } from '@shared/ui/drag-scroll/drag-scroll.directive'

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [DragScrollDirective],
  templateUrl: './carousel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarouselComponent implements AfterViewInit {
  readonly scrollClass = input('gap-2 px-4 pb-2 md:px-6')

  @ViewChild('strip') private stripRef!: ElementRef<HTMLElement>

  protected readonly canScrollLeft = signal(false)
  // Optimistic default: assume there's content to scroll right so button shows immediately
  protected readonly canScrollRight = signal(true)

  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID))

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      // Defer one tick so projected ng-content items are fully rendered before measuring
      setTimeout(() => this.updateScrollState(), 0)
    }
  }

  protected onScroll(): void {
    this.updateScrollState()
  }

  protected scrollPrev(): void {
    const el = this.stripRef.nativeElement
    el.scrollBy({ left: -(el.clientWidth * 0.75), behavior: 'smooth' })
  }

  protected scrollNext(): void {
    const el = this.stripRef.nativeElement
    el.scrollBy({ left: el.clientWidth * 0.75, behavior: 'smooth' })
  }

  private updateScrollState(): void {
    const el = this.stripRef.nativeElement
    this.canScrollLeft.set(el.scrollLeft > 4)
    this.canScrollRight.set(el.scrollLeft < el.scrollWidth - el.clientWidth - 4)
  }
}

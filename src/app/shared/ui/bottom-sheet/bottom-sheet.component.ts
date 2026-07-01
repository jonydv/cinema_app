import { A11yModule, FocusTrap, FocusTrapFactory } from '@angular/cdk/a11y'
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  inject,
  input,
  OnDestroy,
  output,
  ViewChild,
} from '@angular/core'

import { TranslocoModule } from '@ngneat/transloco'

@Component({
  selector: 'app-bottom-sheet',
  standalone: true,
  imports: [A11yModule, TranslocoModule],
  templateUrl: './bottom-sheet.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BottomSheetComponent implements OnDestroy {
  readonly isOpen = input<boolean>(false)
  readonly label = input<string>('Panel')
  readonly closed = output<void>()

  @ViewChild('sheet') private sheetRef!: ElementRef<HTMLElement>

  private readonly focusTrapFactory = inject(FocusTrapFactory)
  private focusTrap: FocusTrap | null = null

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        afterNextRender(() => this.activateFocusTrap())
      } else {
        this.deactivateFocusTrap()
      }
    })
  }

  close(): void {
    this.closed.emit()
  }

  ngOnDestroy(): void {
    this.deactivateFocusTrap()
  }

  private activateFocusTrap(): void {
    if (!this.sheetRef) return
    this.focusTrap?.destroy()
    this.focusTrap = this.focusTrapFactory.create(this.sheetRef.nativeElement)
    this.focusTrap.focusInitialElementWhenReady()
  }

  private deactivateFocusTrap(): void {
    this.focusTrap?.destroy()
    this.focusTrap = null
  }
}

import { NgClass } from '@angular/common'
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core'

@Component({
  selector: 'app-icon-action-button',
  standalone: true,
  imports: [NgClass],
  template: `
    <button
      type="button"
      class="flex min-h-[36px] min-w-[36px] items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-md transition-all duration-200 md:hover:scale-110"
      [ngClass]="extraClass()"
      [attr.aria-label]="ariaLabel()"
      [attr.aria-pressed]="active()"
      (click)="onClick($event)"
    >
      <ng-content />
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconActionButtonComponent {
  readonly active = input(false)
  readonly ariaLabel = input('')
  readonly extraClass = input('')
  readonly clicked = output<void>()

  protected onClick(event: MouseEvent): void {
    event.stopPropagation()
    event.preventDefault()
    this.clicked.emit()
  }
}

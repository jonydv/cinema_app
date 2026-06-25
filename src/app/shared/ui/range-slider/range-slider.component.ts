import { ChangeDetectionStrategy, Component, input, output } from '@angular/core'

@Component({
  selector: 'app-range-slider',
  standalone: true,
  templateUrl: './range-slider.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RangeSliderComponent {
  readonly min = input<number>(0)
  readonly max = input<number>(10)
  readonly step = input<number>(0.5)
  readonly value = input<number>(0)
  readonly valueChange = output<number>()

  onInput(event: Event): void {
    this.valueChange.emit(Number((event.target as HTMLInputElement).value))
  }
}

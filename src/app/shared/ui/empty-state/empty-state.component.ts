import { ChangeDetectionStrategy, Component, input } from '@angular/core'

@Component({
  selector: 'app-empty-state',
  standalone: true,
  templateUrl: './empty-state.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateComponent {
  readonly icon = input.required<string>()
  readonly title = input.required<string>()
  readonly subtitle = input<string>()
}

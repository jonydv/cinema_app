import { ChangeDetectionStrategy, Component, inject } from '@angular/core'

import { ToastType, ToastService } from '@core/notifications/toast.service'

@Component({
  selector: 'app-toast',
  standalone: true,
  templateUrl: './toast.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastComponent {
  readonly toastService = inject(ToastService)

  toastBg(type: ToastType): string {
    const map: Record<ToastType, string> = {
      success: 'bg-green-600',
      error: 'bg-red-600',
      info: 'bg-blue-600',
    }
    return map[type]
  }

  toastIcon(type: ToastType): string {
    const map: Record<ToastType, string> = {
      success: '✓',
      error: '✕',
      info: 'ℹ',
    }
    return map[type]
  }
}

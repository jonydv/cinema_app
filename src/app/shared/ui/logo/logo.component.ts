import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core'

@Component({
  selector: 'app-logo',
  standalone: true,
  template: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      [attr.viewBox]="iconOnly() ? '0 0 110 110' : '0 0 440 110'"
      [attr.width]="iconOnly() ? size() : '128'"
      [attr.height]="iconOnly() ? size() : '32'"
      role="img"
      aria-label="CineScope"
    >
      <!-- Isotipo (clapperboard + camera) -->
      <g transform="translate(10, 5) scale(0.42)">
        <!-- Top clapperboard -->
        <path
          fill="#c9182b"
          d="M22.5,60 L165,15 C170,13.5 175,16 176.5,21 L188,55 L45,100 L22.5,60 Z"
        />
        <!-- Stripes on top part (white — always on red background) -->
        <path
          fill="#ffffff"
          d="M45,52 L60,48 L48,26 L33,30 Z
             M78,43 L93,39 L81,17 L66,21 Z
             M111,34 L126,30 L114,8 L99,12 Z
             M144,25 L159,21 L147,0 L132,4 Z"
        />
        <!-- Camera body -->
        <path
          fill="#c9182b"
          fill-rule="evenodd"
          d="M25,105 C25,95 33,87 43,87 L165,87 C175,87 183,95 183,105
             L183,200 C183,215 165,225 140,225 L43,225 C20,225 10,210 20,185
             C28,165 40,165 50,170 C60,175 75,185 90,175 C100,168 95,150 80,155
             C65,160 50,135 40,120 C30,105 25,105 25,105 Z"
        />
        <!-- Stripes on body bottom (white) -->
        <path
          fill="#ffffff"
          d="M43,87 L58,87 L73,102 L58,102 Z
             M88,87 L103,87 L118,102 L103,102 Z
             M133,87 L148,87 L163,102 L148,102 Z"
        />
        <!-- Lens -->
        <polygon fill="#c9182b" points="183,130 220,105 220,205 183,180" />
        <!-- Play button (white) -->
        <path
          fill="#ffffff"
          d="M85,120 L140,152 C145,155 145,161 140,164
             L85,196 C80,199 73,195 73,189 L73,127 C73,121 80,117 85,120 Z"
        />
      </g>

      @if (!iconOnly()) {
        <!-- Logotipo text -->
        <text
          font-family="'Inter', 'Segoe UI', 'Helvetica Neue', sans-serif"
          font-weight="700"
          font-size="64"
          letter-spacing="-2"
          transform="translate(115, 82)"
        >
          <!-- "Cine": dark on light bg, light on dark bg -->
          <tspan [attr.fill]="cineFill()">Cine</tspan>
          <!-- "Scope": always brand red -->
          <tspan fill="#c9182b">Scope</tspan>
        </text>
      }
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogoComponent {
  readonly iconOnly = input(false)
  readonly isDark = input(false)
  readonly size = input(36)

  protected readonly cineFill = computed(() => (this.isDark() ? '#e2e8f0' : '#0f172a'))
}

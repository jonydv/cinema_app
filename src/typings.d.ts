// Non-standard browser event for PWA install prompt (Chrome/Edge only).
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<{ outcome: 'accepted' | 'dismissed' }>
}

// Extend DOM WindowEventMap so addEventListener('beforeinstallprompt') is typed.
interface WindowEventMap {
  beforeinstallprompt: BeforeInstallPromptEvent
}

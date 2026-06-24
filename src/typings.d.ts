// lite-youtube-embed ships without TypeScript declarations — we only use it as a side-effect import.
declare module 'lite-youtube-embed'

// Non-standard browser event for PWA install prompt (Chrome/Edge only).
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<{ outcome: 'accepted' | 'dismissed' }>
}

// Extend DOM WindowEventMap so addEventListener('beforeinstallprompt') is typed.
interface WindowEventMap {
  beforeinstallprompt: BeforeInstallPromptEvent
}

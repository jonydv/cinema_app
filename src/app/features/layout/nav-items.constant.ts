export const NAV_ITEMS = [
  { path: '/', label: 'nav.home', icon: '🏠', exact: true },
  { path: '/search', label: 'nav.search', icon: '🔍', exact: false },
  { path: '/favorites', label: 'nav.favorites', icon: '♥', exact: false },
  { path: '/watchlist', label: 'nav.watchlist', icon: '📋', exact: false },
  { path: '/history', label: 'nav.history', icon: '📺', exact: false },
] as const

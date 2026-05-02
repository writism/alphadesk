export const LANDING_PAGES = ['/', '/dashboard', '/market-feed', '/ai-insight', '/board', '/my'] as const
export type LandingPage = typeof LANDING_PAGES[number]

export const LANDING_PAGE_LABELS: Record<LandingPage, string> = {
    '/': 'HOME',
    '/dashboard': 'DASHBOARD',
    '/market-feed': 'MARKET_FEED',
    '/ai-insight': 'AI_INSIGHT',
    '/board': 'BOARD',
    '/my': 'MY',
}

export const DEFAULT_LANDING_PAGE: LandingPage = '/'

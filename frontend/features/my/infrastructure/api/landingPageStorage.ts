import type { LandingPage } from '@/features/my/domain/model/landingPage'
import { DEFAULT_LANDING_PAGE, LANDING_PAGES } from '@/features/my/domain/model/landingPage'

const LANDING_PAGE_KEY = 'alpha_landing_page'

export function getLandingPageLocal(): LandingPage {
    if (typeof window === 'undefined') return DEFAULT_LANDING_PAGE
    const raw = localStorage.getItem(LANDING_PAGE_KEY)
    if (!raw) return DEFAULT_LANDING_PAGE
    if ((LANDING_PAGES as readonly string[]).includes(raw)) return raw as LandingPage
    return DEFAULT_LANDING_PAGE
}

export function saveLandingPageLocal(page: LandingPage): void {
    localStorage.setItem(LANDING_PAGE_KEY, page)
}

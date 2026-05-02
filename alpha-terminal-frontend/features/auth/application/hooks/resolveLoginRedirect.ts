import { fetchWatchlist } from '@/features/watchlist/infrastructure/api/watchlistApi'
import { getLandingPageLocal } from '@/features/my/infrastructure/api/landingPageStorage'

export async function resolveLoginRedirect(): Promise<string> {
    try {
        const watchlist = await fetchWatchlist()
        if (watchlist.length === 0) return '/my'
        return getLandingPageLocal()
    } catch {
        return '/my'
    }
}

export interface WatchlistItem {
    symbol: string
    name: string
    market?: string
}

export interface RecentlyViewedItem {
    symbol: string
    name?: string
    market?: string
    viewed_at: string
}

export interface ClickedCardItem {
    symbol: string
    count: number
}

export interface InteractionHistoryResponse {
    likes: { symbol: string; count: number }[]
    comments: string[]
}

export interface UserProfile {
    account_id: number
    watchlist: WatchlistItem[]
    recently_viewed: RecentlyViewedItem[]
    clicked_cards: ClickedCardItem[]
    preferred_stocks: string[]
    interaction_history: InteractionHistoryResponse
    interests_text: string
}

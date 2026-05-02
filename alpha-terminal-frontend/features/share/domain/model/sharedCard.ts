export type Sentiment = "POSITIVE" | "NEGATIVE" | "NEUTRAL"

export interface SharedCard {
    id: number
    symbol: string
    name: string
    summary: string
    tags: string[]
    sentiment: Sentiment
    sentiment_score: number
    confidence: number
    source_type: string
    url?: string | null
    analyzed_at: string
    sharer_account_id: number | null
    sharer_nickname: string
    like_count: number
    comment_count: number
    created_at: string
    user_has_liked: boolean
}

export interface CardComment {
    id: number
    shared_card_id: number
    content: string
    author_nickname: string
    created_at: string
}

export interface SharedCardListResponse {
    cards: SharedCard[]
    total: number
}

export interface CardCommentListResponse {
    comments: CardComment[]
}

export interface LikeToggleResponse {
    liked: boolean
    like_count: number
}

export interface ShareCardPayload {
    symbol: string
    name: string
    summary: string
    tags: string[]
    sentiment: string
    sentiment_score: number
    confidence: number
    source_type: string
    url?: string | null
    analyzed_at: string
}

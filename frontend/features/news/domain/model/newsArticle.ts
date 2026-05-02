export interface NewsArticleItem {
    title: string
    snippet: string
    source: string
    published_at: string | null
    link: string | null
}

export interface NewsSearchResponse {
    items: NewsArticleItem[]
    total_count: number
    page: number
    page_size: number
}

export interface SaveArticleRequest {
    title: string
    link: string
    source: string
    snippet: string | null
    published_at: string | null
    content: string | null
}

export interface SaveArticleResponse {
    id: number
    saved_at: string
}

export interface SaveInterestArticleRequest {
    title: string
    published_at: string | null
    source: string
    link: string
}

export interface SaveInterestArticleResponse {
    id: number
    title: string
    source: string | null
    link: string
    published_at: string | null
    content: string
}

export interface SavedArticleItem {
    id: number
    title: string
    link: string
    source: string
    snippet: string | null
    published_at: string | null
    saved_at: string
    has_content: boolean
}

export interface SavedArticleListResponse {
    items: SavedArticleItem[]
    total: number
}

export interface ArticleAnalysis {
    article_id: number
    keywords: string[]
    sentiment: string
    sentiment_score: number
}

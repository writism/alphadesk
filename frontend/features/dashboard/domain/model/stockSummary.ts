export type Sentiment = 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL'

export interface PipelineProcessed {
    symbol: string
    skipped: boolean
    reason?: string
}

export interface PipelineResult {
    message: string
    processed: PipelineProcessed[]
}

export type Tag = string | { label: string; category?: string }

export interface StockSummary {
    symbol: string
    name: string
    summary: string
    tags: Tag[]
    sentiment: Sentiment
    sentiment_score: number
    confidence: number
    source_type?: 'NEWS' | 'DISCLOSURE' | 'REPORT'
    url?: string
    analyzed_at?: string
    article_published_at?: string
    source_name?: string
    personalized?: boolean
}

export interface AnalysisLog {
    analyzed_at: string
    symbol: string
    name: string
    summary: string
    tags: string[]
    sentiment: Sentiment
    sentiment_score: number
    confidence: number
    source_type?: 'NEWS' | 'DISCLOSURE' | 'REPORT'
    url?: string
    article_published_at?: string
    source_name?: string
}

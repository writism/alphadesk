export interface PublicSummary {
    symbol: string
    name: string
    summary: string
    tags: string[]
    sentiment: "POSITIVE" | "NEGATIVE" | "NEUTRAL"
    sentiment_score: number
    confidence: number
    source_type: string
    url?: string | null
    analyzed_at?: string | null
}

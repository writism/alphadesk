export type GaugeLabel = "공포" | "중립" | "탐욕"

export interface SentimentGauge {
    score: number
    label: GaugeLabel
}

export interface SentimentDistribution {
    positive: number
    neutral: number
    negative: number
    total: number
}

export interface TopPick {
    symbol: string
    name: string
    sentiment_score: number
    confidence: number
}

export interface HomeStats {
    gauge: SentimentGauge
    distribution: SentimentDistribution
    topPicks: TopPick[]
}

import type { Sentiment } from "@/features/dashboard/domain/model/stockSummary"

export interface BriefingStock {
    symbol: string
    name: string
    sentiment: Sentiment
    sentiment_score: number
    confidence: number
    summary: string
    source_type?: 'NEWS' | 'DISCLOSURE' | 'REPORT'
    url?: string
}

export interface TodayBriefing {
    dateLabel: string          // "2026년 3월 26일" (KST)
    lastAnalyzedAt: string | null  // ISO string
    analyzedCount: number
    positive: BriefingStock[]
    negative: BriefingStock[]
    neutral: BriefingStock[]
    isEmpty: boolean
}

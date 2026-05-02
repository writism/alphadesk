import type { AnalysisLog } from "@/features/dashboard/domain/model/stockSummary"
import type { BriefingStock, TodayBriefing } from "../model/todayBriefing"

function toKSTDate(isoString: string): string {
    // KST = UTC+9
    const d = new Date(new Date(isoString).getTime() + 9 * 60 * 60 * 1000)
    return d.toISOString().slice(0, 10)
}

function todayKST(): string {
    return toKSTDate(new Date().toISOString())
}

export function calcTodayBriefing(logs: AnalysisLog[]): TodayBriefing {
    const today = todayKST()

    const todayLogs = logs.filter((l) => toKSTDate(l.analyzed_at) === today)

    // 종목별 최신 1건만 유지
    const bySymbol = new Map<string, AnalysisLog>()
    for (const log of todayLogs) {
        const prev = bySymbol.get(log.symbol)
        if (!prev || log.analyzed_at > prev.analyzed_at) {
            bySymbol.set(log.symbol, log)
        }
    }

    const unique = Array.from(bySymbol.values())

    const lastAnalyzedAt =
        unique.length > 0
            ? unique.reduce((max, l) => (l.analyzed_at > max ? l.analyzed_at : max), unique[0].analyzed_at)
            : null

    const toBriefingStock = (l: AnalysisLog): BriefingStock => ({
        symbol: l.symbol,
        name: l.name,
        sentiment: l.sentiment,
        sentiment_score: l.sentiment_score,
        confidence: l.confidence,
        summary: l.summary,
        source_type: l.source_type,
        url: l.url,
    })

    const positive = unique
        .filter((l) => l.sentiment === "POSITIVE")
        .sort((a, b) => b.sentiment_score - a.sentiment_score)
        .map(toBriefingStock)

    const negative = unique
        .filter((l) => l.sentiment === "NEGATIVE")
        .sort((a, b) => a.sentiment_score - b.sentiment_score)
        .map(toBriefingStock)

    const neutral = unique
        .filter((l) => l.sentiment === "NEUTRAL")
        .map(toBriefingStock)

    const dateLabel = new Date(today).toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "Asia/Seoul",
    })

    return {
        dateLabel,
        lastAnalyzedAt,
        analyzedCount: unique.length,
        positive,
        negative,
        neutral,
        isEmpty: unique.length === 0,
    }
}

import type { AnalysisLog, StockSummary, Tag } from "./model/stockSummary"

function tagLabels(tags: Tag[]): string[] {
    return tags.map((t) => (typeof t === "string" ? t : t.label)).sort()
}

function logMatchesSummary(log: AnalysisLog, summary: StockSummary): boolean {
    if (log.symbol !== summary.symbol) return false
    const logTags = [...log.tags].sort()
    const sumTags = tagLabels(summary.tags)
    if (logTags.length !== sumTags.length || !logTags.every((t, i) => t === sumTags[i])) return false
    if (log.summary.trim() !== summary.summary.trim()) return false
    if (log.sentiment !== summary.sentiment) return false
    if (Math.abs(log.sentiment_score - summary.sentiment_score) > 1e-5) return false
    if (Math.abs(log.confidence - summary.confidence) > 1e-5) return false
    return true
}

/**
 * AI 분석 요약과 동일한 내용의 로그(종목별 최신 1건)는 숨긴다.
 * 이후 같은 종목에 새 분석이 쌓이면, 그때 이전 요약과 동일했던 기록이 로그에 나타난다.
 */
export function excludeCurrentSummaryFromLogs(logs: AnalysisLog[], summaries: StockSummary[]): AnalysisLog[] {
    if (summaries.length === 0 || logs.length === 0) return logs

    const bySymbol = new Map(summaries.map((s) => [s.symbol, s]))
    const alreadyHiddenForSymbol = new Set<string>()

    return logs.filter((log) => {
        const summary = bySymbol.get(log.symbol)
        if (!summary || !logMatchesSummary(log, summary)) return true
        if (alreadyHiddenForSymbol.has(log.symbol)) return true
        alreadyHiddenForSymbol.add(log.symbol)
        return false
    })
}

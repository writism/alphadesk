"use client"

import { useMemo, useState } from "react"
import { ClientPaginationBar } from "@/app/components/ClientPaginationBar"
import { DailyReturnsHeatmapLegend } from "@/app/components/DailyReturnsHeatmapLegend"
import { StockDailyReturnsHeatmap } from "@/app/components/StockDailyReturnsHeatmap"
import type { AnalysisLog } from "@/features/dashboard/domain/model/stockSummary"
import type { HeatmapItem } from "@/features/stock/domain/model/dailyReturnsHeatmap"
import { useClientPagination } from "@/features/shared/application/hooks/useClientPagination"
import { formatAnalyzedAt } from "./dashboardBadges"

const SOURCE_LABEL: Record<string, string> = {
    NEWS: '뉴스',
    DISCLOSURE: '공시',
    REPORT: '재무',
}

const SENTIMENT_STYLE: Record<string, string> = {
    POSITIVE: 'border-tertiary text-tertiary',
    NEGATIVE: 'border-error text-error',
    NEUTRAL:  'border-on-surface-variant text-on-surface-variant',
}

const SENTIMENT_LABEL: Record<string, string> = {
    POSITIVE: '긍정',
    NEGATIVE: '부정',
    NEUTRAL:  '중립',
}

type Props = {
    analysisLogs: AnalysisLog[]
    totalLogsFromApi?: number
    isSummaryLoading: boolean
    heatmapBySymbol?: Record<string, HeatmapItem>
    heatmapWeeks?: number
}

export function DashboardAnalysisLogsSection({
    analysisLogs,
    totalLogsFromApi,
    isSummaryLoading,
    heatmapBySymbol,
    heatmapWeeks = 6,
}: Props) {
    const rawCount = totalLogsFromApi ?? analysisLogs.length
    const deferredAllAsCurrent = !isSummaryLoading && analysisLogs.length === 0 && rawCount > 0
    const [logsExpanded, setLogsExpanded] = useState(true)

    const showHeatmapLegend = useMemo(
        () => analysisLogs.some((l) => !!heatmapBySymbol?.[l.symbol.trim().toUpperCase()]),
        [analysisLogs, heatmapBySymbol],
    )

    const {
        page: logPage,
        totalPages: logTotalPages,
        pageItems: pagedLogs,
        setPage: setLogPage,
        rangeStart: logRangeStart,
        rangeEnd: logRangeEnd,
        totalItems: logTotal,
        showPagination: logsShowPagination,
    } = useClientPagination(analysisLogs)

    return (
        <section className="mb-10" aria-label="최근 AI 분석 로그">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-outline pb-3">
                <div>
                    <div className="font-mono text-xs font-bold text-on-surface uppercase tracking-widest">
                        AI_ANALYSIS_LOG
                    </div>
                    <div className="font-mono text-xs text-on-surface-variant mt-0.5">
                        가장 최근에 생성된 AI 분석 내용부터 확인할 수 있습니다.
                    </div>
                </div>
                <div className="flex items-center gap-3 font-mono text-xs">
                    {analysisLogs.length > 0 && (
                        <span className="text-outline">{analysisLogs.length}개 로그</span>
                    )}
                    {analysisLogs.length > 0 && (
                        <button
                            type="button"
                            onClick={() => setLogsExpanded((v) => !v)}
                            className="border border-outline px-2 py-1 uppercase hover:bg-surface-container"
                            aria-expanded={logsExpanded}
                        >
                            {logsExpanded ? "COLLAPSE" : "EXPAND"}
                        </button>
                    )}
                </div>
            </div>

            {isSummaryLoading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-28 bg-surface-container animate-pulse" />
                    ))}
                </div>
            ) : deferredAllAsCurrent ? (
                <div className="border border-dashed border-outline px-6 py-10 text-center">
                    <p className="font-mono text-sm text-on-surface-variant mb-1">
                        방금 분석한 내용은 위 <strong className="text-on-surface">AI 분석 요약</strong>에만 표시됩니다.
                    </p>
                    <p className="font-mono text-xs text-outline">
                        같은 종목에 새 분석이 실행되면, 이전 결과가 여기 로그에 쌓입니다.
                    </p>
                </div>
            ) : analysisLogs.length === 0 ? (
                <div className="border border-dashed border-outline px-6 py-10 text-center">
                    <p className="font-mono text-sm text-on-surface-variant mb-1">아직 누적된 분석 로그가 없습니다.</p>
                    <p className="font-mono text-xs text-outline">
                        분석을 실행하려면 화면 상단의 &quot;RUN_ANALYSIS&quot; 버튼을 사용하세요.
                    </p>
                </div>
            ) : logsExpanded ? (
                <div id="dashboard-analysis-log-list" className="space-y-3">
                    {showHeatmapLegend ? (
                        <DailyReturnsHeatmapLegend className="border border-outline-variant bg-surface-container px-3 py-2" />
                    ) : null}

                    {pagedLogs.map((log, index) => {
                        const sentimentStyle = SENTIMENT_STYLE[log.sentiment] ?? SENTIMENT_STYLE.NEUTRAL
                        const sentimentLabel = SENTIMENT_LABEL[log.sentiment] ?? log.sentiment
                        const hi = heatmapBySymbol?.[log.symbol.trim().toUpperCase()]
                        const scoreStr = `${log.sentiment_score > 0 ? '+' : ''}${log.sentiment_score.toFixed(2)}`

                        return (
                            <article
                                key={`${log.symbol}-${log.analyzed_at}-${index}`}
                                className="border border-outline bg-surface-container-low"
                            >
                                <div className="p-5 flex flex-col gap-3">
                                    {/* Header */}
                                    <div className="flex items-center justify-between flex-wrap gap-2">
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <span className="font-mono text-sm font-bold text-outline">{log.symbol}</span>
                                            <span className="font-mono text-base font-bold text-on-surface">{log.name}</span>
                                            {log.source_type && SOURCE_LABEL[log.source_type] && (
                                                <span className="border border-outline font-mono text-xs px-1.5 py-0.5 text-on-surface-variant uppercase">
                                                    {SOURCE_LABEL[log.source_type]}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`border font-mono text-xs px-2 py-0.5 font-bold ${sentimentStyle}`}>
                                                {sentimentLabel} {scoreStr}
                                            </span>
                                            <span className="font-mono text-xs text-outline">
                                                {formatAnalyzedAt(log.analyzed_at)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Summary */}
                                    <p className="font-mono text-sm text-on-surface leading-relaxed">{log.summary}</p>

                                    {/* Heatmap */}
                                    {hi ? (
                                        <StockDailyReturnsHeatmap
                                            item={hi}
                                            weeks={heatmapWeeks}
                                            showLegend={false}
                                            sentimentScore={log.sentiment_score}
                                        />
                                    ) : null}

                                    {/* Tags + Confidence */}
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {log.tags.map((tag) => (
                                            <span
                                                key={`${log.symbol}-${log.analyzed_at}-${tag}`}
                                                className="border border-outline font-mono text-xs px-2 py-0.5 text-on-surface-variant"
                                            >
                                                #{tag}
                                            </span>
                                        ))}
                                        <span className="font-mono text-xs text-outline ml-auto">
                                            신뢰도 {(log.confidence * 100).toFixed(0)}%
                                        </span>
                                    </div>

                                    {/* Confidence bar */}
                                    <div className="h-1 bg-surface-container-highest">
                                        <div
                                            className="h-full bg-primary"
                                            style={{ width: `${log.confidence * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </article>
                        )
                    })}

                    {logsShowPagination ? (
                        <ClientPaginationBar
                            page={logPage}
                            totalPages={logTotalPages}
                            onPageChange={setLogPage}
                            rangeStart={logRangeStart}
                            rangeEnd={logRangeEnd}
                            totalItems={logTotal}
                        />
                    ) : null}
                </div>
            ) : (
                <p id="dashboard-analysis-log-list" className="font-mono text-sm text-outline">
                    로그 목록을 접었습니다. &quot;EXPAND&quot; 버튼으로 다시 볼 수 있습니다.
                </p>
            )}
        </section>
    )
}

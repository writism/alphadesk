"use client"

import { useEffect, useRef, useState } from "react"
import { recordEvent } from "@/features/analytics/infrastructure/api/activityApi"
import type { PipelineProgressEvent } from "@/features/dashboard/domain/model/pipelineProgressEvent"
import type { StockSummary } from "@/features/dashboard/domain/model/stockSummary"
import { DailyReturnsHeatmapLegend } from "@/app/components/DailyReturnsHeatmapLegend"
import type { HeatmapItem } from "@/features/stock/domain/model/dailyReturnsHeatmap"
import StockSummaryCard from "../../components/StockSummaryCard"
import { DashboardPipelineProgressPanel } from "./DashboardPipelineProgressPanel"

type Tab = "news" | "report"

type Props = {
    summaries: StockSummary[]
    reportSummaries: StockSummary[]
    isSummaryLoading: boolean
    running: boolean
    watchlistCount: number
    progressEvents: PipelineProgressEvent[]
    heatmapBySymbol?: Record<string, HeatmapItem>
    heatmapWeeks?: number
    isLoggedIn?: boolean
    onCardClick?: (symbol: string, name: string) => void
}

export function DashboardSummarySection({
    summaries,
    reportSummaries,
    isSummaryLoading,
    running,
    watchlistCount,
    progressEvents,
    heatmapBySymbol,
    heatmapWeeks = 6,
    isLoggedIn = false,
    onCardClick,
}: Props) {
    const [activeTab, setActiveTab] = useState<Tab>("news")
    const activeSummaries = activeTab === "news" ? summaries : reportSummaries

    const prevRunning = useRef(false)
    useEffect(() => {
        if (prevRunning.current === true && running === false && summaries.length > 0) {
            recordEvent("core_complete")
        }
        prevRunning.current = running
    }, [running, summaries])
    const showInitialSkeleton = isSummaryLoading && !running && summaries.length === 0

    const hasAnyHeatmap = activeSummaries.some(
        (s) => !!heatmapBySymbol?.[s.symbol.trim().toUpperCase()],
    )

    return (
        <section className="mb-10" aria-label="AI 분석 요약" aria-busy={running || undefined}>
            {/* Section Header */}
            <div className="mb-4 border-b border-outline pb-3">
                <div className="font-mono text-xs font-bold text-on-surface uppercase tracking-widest">
                    AI_ANALYSIS_SUMMARY
                </div>
            </div>

            {/* Tabs */}
            <div className="flex mb-4 border-b border-outline">
                <button
                    type="button"
                    onClick={() => setActiveTab("news")}
                    className={`font-mono text-xs px-4 py-2 uppercase border-b-2 -mb-px ${
                        activeTab === "news"
                            ? "border-primary text-primary font-bold"
                            : "border-transparent text-on-surface-variant hover:text-on-surface"
                    }`}
                >
                    뉴스_분석
                    {summaries.length > 0 && (
                        <span className="ml-1.5 border border-primary text-primary font-mono text-[10px] px-1">
                            {summaries.length}
                        </span>
                    )}
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab("report")}
                    className={`font-mono text-xs px-4 py-2 uppercase border-b-2 -mb-px ${
                        activeTab === "report"
                            ? "border-primary text-primary font-bold"
                            : "border-transparent text-on-surface-variant hover:text-on-surface"
                    }`}
                >
                    공시·리포트
                    {reportSummaries.length > 0 && (
                        <span className="ml-1.5 border border-primary text-primary font-mono text-[10px] px-1">
                            {reportSummaries.length}
                        </span>
                    )}
                </button>
            </div>

            {/* Skeleton */}
            {showInitialSkeleton ? (
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-28 bg-surface-container animate-pulse" />
                    ))}
                </div>
            ) : null}

            {/* Running state */}
            {running ? (
                <div className={`border border-dashed border-primary bg-primary-fixed/10 px-4 py-6 ${running ? "mb-4" : ""}`}>
                    {progressEvents.length > 0 ? (
                        <DashboardPipelineProgressPanel events={progressEvents} />
                    ) : (
                        <div role="status" aria-live="polite" className="text-center font-mono text-sm text-primary animate-pulse">
                            ANALYZING... 분석을 준비하는 중입니다
                        </div>
                    )}
                </div>
            ) : null}

            {/* Summary cards */}
            {!showInitialSkeleton && activeSummaries.length > 0 ? (
                <>
                    {hasAnyHeatmap ? (
                        <DailyReturnsHeatmapLegend
                            className={`mb-3 border border-outline-variant bg-surface-container px-3 py-2 ${running ? "mt-4" : ""}`}
                        />
                    ) : null}
                    <div className={`space-y-3 ${running ? "mt-4" : ""}`}>
                        {activeSummaries.map((stock) => {
                            const hi = heatmapBySymbol?.[stock.symbol.trim().toUpperCase()]
                            return (
                                <StockSummaryCard
                                    key={stock.symbol}
                                    symbol={stock.symbol}
                                    name={stock.name}
                                    summary={stock.summary}
                                    tags={stock.tags}
                                    sentiment={stock.sentiment}
                                    sentiment_score={stock.sentiment_score}
                                    confidence={stock.confidence}
                                    source_type={stock.source_type}
                                    url={stock.url}
                                    heatmap={hi ? { item: hi, weeks: heatmapWeeks } : undefined}
                                    analyzed_at={stock.analyzed_at}
                                    article_published_at={stock.article_published_at}
                                    source_name={stock.source_name}
                                    isLoggedIn={isLoggedIn}
                                    showBoardPublishButton={isLoggedIn}
                                    onCardClick={onCardClick ? () => onCardClick(stock.symbol, stock.name) : undefined}
                                />
                            )
                        })}
                    </div>
                </>
            ) : null}

            {/* Empty state */}
            {!showInitialSkeleton && !running && activeSummaries.length === 0 ? (
                <div className="border border-dashed border-outline py-10 text-center">
                    <p className="font-mono text-sm text-on-surface-variant mb-2">
                        {activeTab === "news" ? "아직 분석된 뉴스가 없습니다." : "아직 분석된 공시·리포트가 없습니다."}
                    </p>
                    <p className="font-mono text-xs text-outline mb-3">
                        상단의 &quot;RUN_ANALYSIS&quot; 버튼으로 분석을 실행할 수 있습니다.
                    </p>
                    {watchlistCount === 0 && (
                        <a
                            href="/watchlist"
                            className="font-mono text-xs border border-outline px-4 py-2 text-on-surface-variant hover:bg-surface-container uppercase inline-block"
                        >
                            관심종목 등록하기
                        </a>
                    )}
                </div>
            ) : null}
        </section>
    )
}

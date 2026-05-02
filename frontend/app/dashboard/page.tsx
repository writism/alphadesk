"use client"

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useDashboard } from "@/features/dashboard/application/hooks/useDashboard"
import { excludeCurrentSummaryFromLogs } from "@/features/dashboard/domain/excludeCurrentSummaryFromLogs"
import { useDailyReturnsHeatmap } from "@/features/stock/application/hooks/useDailyReturnsHeatmap"
import { useWatchlist } from "@/features/watchlist/application/hooks/useWatchlist"
import { useAuth } from "@/features/auth/application/hooks/useAuth"
import { useRecordRecentlyViewed } from "@/features/profile/application/hooks/useRecordRecentlyViewed"
import { useTrackEvent } from "@/features/analytics/application/hooks/useTrackEvent"
import { DashboardAnalysisLogsSection } from "./components/DashboardAnalysisLogsSection"
import { DashboardPipelineResult } from "./components/DashboardPipelineResult"
import { DashboardSummarySection } from "./components/DashboardSummarySection"
import { DashboardWatchlistSection } from "./components/DashboardWatchlistSection"

function AutorunHandler({ onAutorun }: { onAutorun: () => void }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const fired = useRef(false)

    useEffect(() => {
        if (searchParams.get("autorun") !== "true" || fired.current) return
        fired.current = true
        router.replace("/dashboard")
        onAutorun()
    }, [searchParams, router, onAutorun])

    return null
}

export default function DashboardPage() {
    useTrackEvent("visit")
    const { state: authState } = useAuth()
    const isLoggedIn = authState.status === "AUTHENTICATED"
    const router = useRouter()
    const recordRecentlyViewed = useRecordRecentlyViewed()
    const [pendingAutorun, setPendingAutorun] = useState(false)
    const handleAutorun = useCallback(() => setPendingAutorun(true), [])

    useEffect(() => {
        if (authState.status === "PENDING_TERMS") {
            router.replace("/terms")
        }
    }, [authState.status, router])

    const handleCardClick = useCallback(
        (symbol: string, name: string) => {
            recordRecentlyViewed({ symbol, name })
        },
        [recordRecentlyViewed],
    )
    const {
        summaries,
        reportSummaries,
        analysisLogs,
        isLoading: isSummaryLoading,
        error: summaryError,
        running,
        pipelineResult,
        progressEvents,
        elapsedSeconds,
        executePipeline,
        reload,
    } = useDashboard()
    const { items, isLoading: isWatchlistLoading, error: watchlistError } = useWatchlist()
    const [selectedSymbols, setSelectedSymbols] = useState<string[]>([])
    const [hasInitializedSelection, setHasInitializedSelection] = useState(false)

    useEffect(() => {
        const itemSymbols = items.map((item) => item.symbol)

        if (itemSymbols.length === 0) {
            setSelectedSymbols([])
            setHasInitializedSelection(false)
            return
        }

        setSelectedSymbols((prev) => {
            if (!hasInitializedSelection) return itemSymbols
            return prev.filter((symbol) => itemSymbols.includes(symbol))
        })
        setHasInitializedSelection(true)
    }, [items, hasInitializedSelection])

    const selectedCount = selectedSymbols.length
    const allSelected = items.length > 0 && selectedCount === items.length

    const handleSelectSymbol = (symbol: string, checked: boolean) => {
        setSelectedSymbols((prev) => {
            if (checked) {
                return prev.includes(symbol) ? prev : [...prev, symbol]
            }
            return prev.filter((item) => item !== symbol)
        })
    }

    const handleSelectAll = (checked: boolean) => {
        setSelectedSymbols(checked ? items.map((item) => item.symbol) : [])
    }

    const handleRunPipeline = async () => {
        if (selectedSymbols.length === 0) return
        await executePipeline(selectedSymbols)
    }

    useEffect(() => {
        if (!pendingAutorun || !hasInitializedSelection || selectedSymbols.length === 0 || running) return
        setPendingAutorun(false)
        executePipeline(selectedSymbols)
    }, [pendingAutorun, hasInitializedSelection, selectedSymbols, running, executePipeline])

    const allSkipped = pipelineResult ? pipelineResult.processed.every((p) => p.skipped) : false
    const canRun = selectedSymbols.length > 0

    const analysisLogsForDisplay = useMemo(
        () => excludeCurrentSummaryFromLogs(analysisLogs, summaries),
        [analysisLogs, summaries],
    )

    const heatmapSymbols = useMemo(() => {
        const ids = new Set<string>()
        for (const s of summaries) {
            ids.add(s.symbol.trim().toUpperCase())
        }
        for (const l of analysisLogsForDisplay) {
            ids.add(l.symbol.trim().toUpperCase())
        }
        return Array.from(ids)
    }, [summaries, analysisLogsForDisplay])

    const { bySymbol: heatmapBySymbol, data: heatmapData } = useDailyReturnsHeatmap(heatmapSymbols, 6)

    return (
        <>
        <Suspense fallback={null}>
            <AutorunHandler onAutorun={handleAutorun} />
        </Suspense>
        {/* Sticky 페이지 헤더 */}
        <div className="sticky top-0 z-40 bg-surface border-b border-outline">
            <div className="max-w-5xl mx-auto px-6 md:px-8 flex items-stretch justify-between">
                <div className="flex flex-col px-5 py-3 font-mono text-xs uppercase">
                    <span className="font-bold tracking-widest text-on-surface">DASHBOARD</span>
                    <span className="text-[9px] text-on-surface-variant/60 normal-case mt-0.5">관심종목 AI 분석 요약</span>
                </div>
                <div className="flex items-center pr-2">
                    <button
                        type="button"
                        onClick={handleRunPipeline}
                        disabled={running || isSummaryLoading || !canRun}
                        className="flex items-center gap-1.5 bg-primary px-3 py-1.5 font-mono text-[10px] text-white uppercase hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {running && (
                            <span className="inline-block w-2.5 h-2.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        )}
                        {running
                            ? `ANALYZING... (${selectedSymbols.length})`
                            : `RUN_ANALYSIS (${selectedSymbols.length})`}
                    </button>
                </div>
            </div>
        </div>
        <main
            className="max-w-5xl mx-auto px-6 md:px-8 pt-4 pb-24 md:pb-8"
            aria-busy={running}
        >
            <DashboardPipelineResult
                running={running}
                pipelineResult={pipelineResult}
                allSkipped={allSkipped}
                elapsedSeconds={elapsedSeconds}
            />

            {summaryError && (
                <div className="mb-4 flex flex-wrap items-center gap-3 border border-outline px-4 py-3 font-mono text-[11px] text-error">
                    <span className="flex-1">[ERROR] {summaryError}</span>
                    <button
                        type="button"
                        onClick={() => reload()}
                        className="shrink-0 border border-outline px-3 py-1 font-mono text-[11px] uppercase hover:bg-surface-container"
                    >
                        RETRY
                    </button>
                </div>
            )}

            <DashboardWatchlistSection
                items={items}
                isWatchlistLoading={isWatchlistLoading}
                watchlistError={watchlistError}
                selectedSymbols={selectedSymbols}
                allSelected={allSelected}
                selectedCount={selectedCount}
                running={running}
                onSelectAll={handleSelectAll}
                onSelectSymbol={handleSelectSymbol}
            />

            <DashboardSummarySection
                summaries={summaries}
                reportSummaries={reportSummaries}
                isSummaryLoading={isSummaryLoading}
                running={running}
                watchlistCount={items.length}
                progressEvents={progressEvents}
                heatmapBySymbol={heatmapBySymbol}
                heatmapWeeks={heatmapData?.weeks ?? 6}
                isLoggedIn={isLoggedIn}
                onCardClick={handleCardClick}
            />

            <DashboardAnalysisLogsSection
                analysisLogs={analysisLogsForDisplay}
                totalLogsFromApi={analysisLogs.length}
                isSummaryLoading={isSummaryLoading}
                heatmapBySymbol={heatmapBySymbol}
                heatmapWeeks={heatmapData?.weeks ?? 6}
            />
        </main>
        </>
    )
}

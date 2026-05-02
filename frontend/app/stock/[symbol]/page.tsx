"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { fetchStockDetail } from "@/features/stock/infrastructure/api/stockApi"
import { isSafeUrl } from "@/infrastructure/utils/urlValidator"
import { useWatchlist } from "@/features/watchlist/application/hooks/useWatchlist"
import { useAuth } from "@/features/auth/application/hooks/useAuth"
import { StockDailyReturnsHeatmap } from "@/app/components/StockDailyReturnsHeatmap"
import { DailyReturnsHeatmapLegend } from "@/app/components/DailyReturnsHeatmapLegend"
import type { StockDetail } from "@/features/stock/domain/model/stockDetail"
import type { HeatmapItem } from "@/features/stock/domain/model/dailyReturnsHeatmap"
import { SENTIMENT_BADGE, formatAnalyzedAt } from "@/app/dashboard/components/dashboardBadges"

const SOURCE_LABEL: Record<string, string> = {
    NEWS: "뉴스",
    DISCLOSURE: "공시",
    REPORT: "재무",
}
const SOURCE_STYLE: Record<string, string> = {
    NEWS: "border border-outline text-on-surface-variant",
    DISCLOSURE: "border border-outline text-on-surface-variant",
    REPORT: "border border-outline text-on-surface-variant",
}
const MARKET_STYLE: Record<string, string> = {
    KOSPI: "border-primary text-primary",
    KOSDAQ: "border-tertiary text-tertiary",
    NASDAQ: "border-on-surface-variant text-on-surface-variant",
    NYSE: "border-on-surface-variant text-on-surface-variant",
}

export default function StockDetailPage() {
    const params = useParams()
    const router = useRouter()
    const symbol = (params.symbol as string).toUpperCase()

    const [detail, setDetail] = useState<StockDetail | null>(null)
    const [heatmapItem, setHeatmapItem] = useState<HeatmapItem | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const { state: authState } = useAuth()
    const isLoggedIn = authState.status === "AUTHENTICATED"
    const { items: watchlistItems, add: addToWatchlist, remove: removeFromWatchlist } = useWatchlist()

    const watchlistItem = watchlistItems.find((w) => w.symbol === symbol)
    const isInWatchlist = !!watchlistItem

    useEffect(() => {
        setLoading(true)
        fetchStockDetail(symbol)
            .then(setDetail)
            .catch(() => setError("종목 정보를 불러오지 못했습니다."))
            .finally(() => setLoading(false))
    }, [symbol])

    useEffect(() => {
        if (!detail) return
        fetch(`/api/stocks/daily-returns-heatmap?symbols=${symbol}&weeks=8`)
            .then((r) => r.ok ? r.json() : null)
            .then((data) => {
                if (data?.items?.[symbol]) setHeatmapItem(data.items[symbol])
            })
            .catch(() => null)
    }, [detail, symbol])

    const handleWatchlistToggle = async () => {
        if (!detail) return
        if (isInWatchlist && watchlistItem) {
            await removeFromWatchlist(watchlistItem.id)
        } else {
            await addToWatchlist(symbol, detail.name, detail.market ?? undefined)
        }
    }

    if (loading) {
        return (
            <main className="mx-auto max-w-2xl px-4 py-10">
                <div className="space-y-3">
                    <div className="h-16 animate-pulse bg-surface-container" />
                    <div className="h-40 animate-pulse bg-surface-container" />
                    <div className="h-28 animate-pulse bg-surface-container" />
                </div>
            </main>
        )
    }

    if (error || !detail) {
        return (
            <main className="mx-auto max-w-2xl px-4 py-16 text-center">
                <p className="font-mono text-[11px] text-outline">{error ?? "종목을 찾을 수 없습니다."}</p>
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="mt-4 font-mono text-[11px] text-primary uppercase hover:underline"
                >
                    BACK
                </button>
            </main>
        )
    }

    return (
        <main className="mx-auto max-w-2xl px-4 py-8">
            {/* 헤더 */}
            <div className="mb-6 flex items-start justify-between gap-4 border-b border-outline pb-4">
                <div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <h1 className="font-headline font-bold text-on-surface text-2xl uppercase tracking-tighter">
                            {detail.name}
                        </h1>
                        <span className="font-mono text-xs text-outline">{detail.symbol}</span>
                        {detail.market && (
                            <span className={`border font-mono px-1.5 py-0.5 text-[9px] uppercase font-bold ${MARKET_STYLE[detail.market] ?? "border-outline text-outline"}`}>
                                {detail.market}
                            </span>
                        )}
                    </div>
                </div>
                {isLoggedIn && (
                    <button
                        type="button"
                        onClick={handleWatchlistToggle}
                        className={`shrink-0 border px-3 py-1.5 font-mono text-[11px] uppercase ${
                            isInWatchlist
                                ? "border-primary bg-primary text-white"
                                : "border-outline text-on-surface-variant hover:bg-surface-container"
                        }`}
                    >
                        {isInWatchlist ? "★ WATCHING" : "☆ ADD_WATCH"}
                    </button>
                )}
            </div>

            {/* 히트맵 */}
            {heatmapItem && (
                <section className="mb-6">
                    <DailyReturnsHeatmapLegend className="mb-2 border border-outline-variant bg-surface-container px-3 py-2 font-mono text-[10px]" />
                    <div className="border border-outline bg-surface-container-low px-4 py-4">
                        <StockDailyReturnsHeatmap item={heatmapItem} weeks={8} showLegend={false} />
                    </div>
                </section>
            )}

            {/* AI 분석 이력 */}
            <section>
                <div className="mb-3 font-mono text-[10px] font-bold text-on-surface uppercase tracking-widest">
                    AI_ANALYSIS_LOG
                </div>
                {detail.analysis_logs.length === 0 ? (
                    <div className="border border-dashed border-outline px-6 py-10 text-center">
                        <p className="font-mono text-[11px] text-outline">아직 AI 분석 내역이 없습니다.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {detail.analysis_logs.map((log, i) => {
                            const sentimentClass = SENTIMENT_BADGE[log.sentiment] ?? SENTIMENT_BADGE.NEUTRAL
                            return (
                                <article
                                    key={`${log.analyzed_at}-${i}`}
                                    className="border border-outline bg-surface-container-low px-4 py-4"
                                >
                                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                                        <div className="flex flex-wrap items-center gap-2">
                                            {log.source_type && SOURCE_LABEL[log.source_type] && (
                                                <span className={`font-mono px-1.5 py-0.5 text-[9px] uppercase ${SOURCE_STYLE[log.source_type]}`}>
                                                    {SOURCE_LABEL[log.source_type]}
                                                </span>
                                            )}
                                            <span className={`font-mono px-2 py-0.5 text-[10px] font-bold uppercase ${sentimentClass}`}>
                                                {log.sentiment}
                                            </span>
                                        </div>
                                        <span className="font-mono text-[10px] text-outline">{formatAnalyzedAt(log.analyzed_at)}</span>
                                    </div>
                                    <p className="mb-3 font-mono text-[12px] leading-6 text-on-surface">{log.summary}</p>
                                    <div className="flex flex-wrap items-center gap-2 font-mono text-[10px]">
                                        {log.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="border border-outline px-2 py-0.5 text-on-surface-variant"
                                            >
                                                #{tag}
                                            </span>
                                        ))}
                                        <span className="text-outline">신뢰도 {(log.confidence * 100).toFixed(0)}%</span>
                                        <span className="text-outline">감성 {log.sentiment_score.toFixed(2)}</span>
                                    </div>
                                    {isSafeUrl(log.url) && (
                                        <a
                                            href={log.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="mt-2 block font-mono text-[10px] text-primary hover:underline"
                                        >
                                            SOURCE →
                                        </a>
                                    )}
                                </article>
                            )
                        })}
                    </div>
                )}
            </section>
        </main>
    )
}

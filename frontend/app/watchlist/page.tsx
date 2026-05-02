'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAtomValue } from 'jotai'
import { authStateAtom } from '@/features/auth/application/atoms/authAtom'
import { ClientPaginationBar } from '@/app/components/ClientPaginationBar'
import { DailyReturnsHeatmapLegend } from '@/app/components/DailyReturnsHeatmapLegend'
import { WatchlistHeatmapCollapsible } from '@/app/components/WatchlistHeatmapCollapsible'
import { useDailyReturnsHeatmap } from '@/features/stock/application/hooks/useDailyReturnsHeatmap'
import { useStockSearch } from '@/features/stock/application/hooks/useStockSearch'
import type { StockItem } from '@/features/stock/domain/model/stockItem'
import { useClientPagination } from '@/features/shared/application/hooks/useClientPagination'
import { useWatchlist } from '@/features/watchlist/application/hooks/useWatchlist'
import { useAccountSettings } from '@/features/account/application/hooks/useAccountSettings'
import { recordEvent } from '@/features/analytics/infrastructure/api/activityApi'

const MARKET_BADGE: Record<string, string> = {
    KOSPI:  'border-primary text-primary',
    KOSDAQ: 'border-tertiary text-tertiary',
    NASDAQ: 'border-on-surface-variant text-on-surface-variant',
    NYSE:   'border-on-surface-variant text-on-surface-variant',
}

function MarketBadge({ market }: { market?: string | null }) {
    if (!market) return null
    const cls = MARKET_BADGE[market] ?? 'border-outline text-outline'
    return (
        <span className={`border font-mono px-1.5 py-0.5 text-xs font-bold ${cls}`}>
            {market}
        </span>
    )
}

export default function WatchlistPage() {
    const authState = useAtomValue(authStateAtom)
    const router = useRouter()
    const { items, isLoading, error, add, remove } = useWatchlist()
    const { results, isLoading: isSearching, error: searchError, query, search, clear } = useStockSearch()
    const { isWatchlistPublic, isLoading: isSettingsLoading, isSaving, toggle: togglePublic } = useAccountSettings()
    const [registering, setRegistering] = useState<string | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<{ id: number; symbol: string; name: string } | null>(null)

    useEffect(() => {
        if (authState.status === 'PENDING_TERMS') {
            router.replace('/terms')
        }
    }, [authState.status, router])

    const watchlistSymbols = useMemo(() => items.map((i) => i.symbol), [items])
    const { bySymbol: heatmapBySymbol, data: heatmapData } = useDailyReturnsHeatmap(watchlistSymbols, 6)

    const showHeatmapLegend = useMemo(
        () => items.some((i) => !!heatmapBySymbol[i.symbol.trim().toUpperCase()]),
        [items, heatmapBySymbol],
    )

    const {
        page: watchlistPage,
        totalPages: watchlistTotalPages,
        pageItems: pagedWatchlistItems,
        setPage: setWatchlistPage,
        rangeStart: wlRangeStart,
        rangeEnd: wlRangeEnd,
        totalItems: wlTotal,
        showPagination: watchlistShowPagination,
    } = useClientPagination(items)

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        search(e.target.value)
    }

    const handleRegister = async (item: StockItem) => {
        setRegistering(item.symbol)
        recordEvent("core_start")
        const ok = await add(item.symbol, item.name, item.market)
        setRegistering(null)
        if (ok) clear()
    }

    return (
        <main className="max-w-5xl mx-auto p-6 pt-8 md:p-8">
            <div className="mb-6 border-b border-outline pb-4">
                <div className="font-headline font-bold text-on-surface text-xl uppercase tracking-tighter">
                    WATCHLIST
                </div>
                <div className="font-mono text-sm text-on-surface-variant mt-0.5">
                    관심종목 등록 및 관리
                </div>
            </div>

            {/* 공개 설정 */}
            {!isSettingsLoading && (
                <section className="mb-6 border border-outline-variant bg-surface-container px-4 py-3">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <div className="font-mono text-xs font-bold text-on-surface uppercase tracking-widest">
                                PUBLIC_FEED 참여
                            </div>
                            <div className="font-mono text-xs text-on-surface-variant mt-0.5">
                                홈 화면 공개 피드에 내 관심종목 기반 AI 분석이 포함됩니다.
                            </div>
                        </div>
                        <button
                            type="button"
                            disabled={isSaving}
                            onClick={() => togglePublic(!isWatchlistPublic)}
                            className={`shrink-0 font-mono text-xs px-3 py-1.5 border uppercase font-bold transition-none ${
                                isWatchlistPublic
                                    ? "bg-primary border-primary text-white hover:opacity-80"
                                    : "border-outline text-on-surface-variant hover:bg-surface-container-high"
                            } ${isSaving ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                            {isSaving ? "저장 중..." : isWatchlistPublic ? "공개 중" : "비공개"}
                        </button>
                    </div>
                </section>
            )}

            {/* 검색 UI */}
            <section className="mb-8">
                <div className="font-mono text-xs font-bold text-on-surface uppercase tracking-widest mb-2">
                    STOCK_SEARCH
                </div>
                <div className="relative">
                    <div className="flex items-center gap-2 px-3 py-2.5 border border-outline bg-surface-container-lowest focus-within:border-primary">
                        <span className="material-symbols-outlined text-[18px] text-outline shrink-0">search</span>
                        <input
                            type="text"
                            value={query}
                            onChange={handleSearch}
                            placeholder="종목명 또는 코드로 검색 (예: 삼성전자, 005930)"
                            className="flex-1 bg-transparent outline-none font-mono text-sm text-on-surface placeholder:text-outline"
                        />
                        {isSearching ? (
                            <span className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin shrink-0" />
                        ) : query.length > 0 ? (
                            <button
                                type="button"
                                onClick={clear}
                                className="shrink-0 text-outline hover:text-on-surface transition-none"
                                aria-label="검색어 삭제"
                            >
                                <span className="material-symbols-outlined text-[18px]">close</span>
                            </button>
                        ) : null}
                    </div>

                    {searchError && (
                        <p className="mt-1.5 font-mono text-sm text-error">[ERROR] {searchError}</p>
                    )}

                    {query.length > 0 && !isSearching && results.length === 0 && !searchError && (
                        <p className="mt-1.5 font-mono text-sm text-outline">검색 결과가 없습니다.</p>
                    )}

                    {/* 검색 드롭다운 */}
                    {results.length > 0 && (
                        <ul className="absolute z-50 w-full mt-0 bg-surface-container-lowest border border-primary/40 shadow-[0_4px_24px_rgba(0,0,0,0.5)] max-h-64 overflow-y-auto">
                            {results.map((item) => (
                                <li key={item.symbol} className="border-b border-outline-variant last:border-b-0">
                                    <button
                                        type="button"
                                        onClick={() => handleRegister(item)}
                                        disabled={registering === item.symbol}
                                        className="w-full flex items-center justify-between px-3 py-3 hover:bg-primary/15 text-left disabled:opacity-50"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="font-mono text-xs text-outline w-16">{item.symbol}</span>
                                            <span className="font-mono text-sm font-medium text-on-surface">{item.name}</span>
                                            <MarketBadge market={item.market} />
                                        </div>
                                        <span className="font-mono text-sm text-primary shrink-0 uppercase font-bold">
                                            {registering === item.symbol ? 'ADDING...' : '+ ADD'}
                                        </span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <p className="mt-1.5 font-mono text-xs text-outline">검색 결과를 클릭하면 바로 관심종목에 추가됩니다.</p>
            </section>

            {error && (
                <div className="mb-4 px-3 py-2 border border-outline font-mono text-sm text-error">
                    [ERROR] {error}
                </div>
            )}

            {/* 관심종목 목록 */}
            <section>
                <div className="font-mono text-xs font-bold text-on-surface uppercase tracking-widest mb-3 flex items-center gap-2">
                    REGISTERED_STOCKS
                    <span className="text-outline font-normal">({items.length})</span>
                </div>

                {!isLoading && items.length > 0 && showHeatmapLegend ? (
                    <DailyReturnsHeatmapLegend className="mb-3 border border-outline-variant bg-surface-container px-3 py-2" />
                ) : null}

                {isLoading ? (
                    <div className="flex flex-col gap-2">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-14 bg-surface-container animate-pulse" />
                        ))}
                    </div>
                ) : items.length === 0 ? (
                    <p className="font-mono text-sm text-outline py-10 text-center border border-dashed border-outline">
                        관심종목을 검색해서 추가해보세요.
                    </p>
                ) : (
                    <>
                        <ul className="flex flex-col gap-2">
                            {pagedWatchlistItems.map((item) => {
                                const hi = heatmapBySymbol[item.symbol.trim().toUpperCase()]
                                return (
                                    <li
                                        key={item.id}
                                        className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-4 py-3 border border-outline"
                                    >
                                        <div className="flex flex-col gap-2 min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-3">
                                                <Link href={`/stock/${item.symbol}`} className="font-mono text-xs font-bold text-outline hover:text-primary">
                                                    {item.symbol}
                                                </Link>
                                                <Link href={`/stock/${item.symbol}`} className="font-mono text-sm font-medium text-on-surface hover:text-primary">
                                                    {item.name}
                                                </Link>
                                                <MarketBadge market={item.market} />
                                            </div>
                                            {hi ? (
                                                <WatchlistHeatmapCollapsible
                                                    item={hi}
                                                    weeks={heatmapData?.weeks ?? 6}
                                                />
                                            ) : null}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setDeleteTarget({ id: item.id, symbol: item.symbol, name: item.name })}
                                            className="font-mono text-sm text-error border border-outline px-3 py-1.5 hover:bg-error hover:text-white hover:border-error uppercase"
                                        >
                                            DEL
                                        </button>
                                    </li>
                                )
                            })}
                        </ul>
                        {watchlistShowPagination ? (
                            <ClientPaginationBar
                                page={watchlistPage}
                                totalPages={watchlistTotalPages}
                                onPageChange={setWatchlistPage}
                                rangeStart={wlRangeStart}
                                rangeEnd={wlRangeEnd}
                                totalItems={wlTotal}
                                className="mt-3"
                            />
                        ) : null}
                    </>
                )}
            </section>

            {/* 삭제 확인 모달 */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <button
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={() => setDeleteTarget(null)}
                        aria-label="닫기"
                    />
                    <div className="relative z-10 w-full max-w-sm mx-4 border border-primary/40 bg-surface-container-lowest p-6 shadow-[0_0_40px_rgba(0,1,187,0.15)]">
                        <div className="font-mono text-xs font-bold text-error uppercase tracking-widest mb-4">
                            ⚠ CONFIRM_DELETE
                        </div>
                        <div className="font-mono text-sm text-on-surface mb-1">
                            다음 종목을 관심목록에서 삭제합니다.
                        </div>
                        <div className="font-mono text-sm text-on-surface-variant border border-outline-variant px-3 py-2 mb-5">
                            <span className="text-outline mr-2">{deleteTarget.symbol}</span>
                            <span className="font-bold text-on-surface">{deleteTarget.name}</span>
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setDeleteTarget(null)}
                                className="flex-1 font-mono text-sm border border-outline-variant px-3 py-2 text-on-surface-variant hover:bg-surface-container-high uppercase"
                            >
                                CANCEL
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    remove(deleteTarget.id)
                                    setDeleteTarget(null)
                                }}
                                className="flex-1 font-mono text-sm border border-error bg-error text-white px-3 py-2 hover:opacity-90 uppercase font-bold"
                            >
                                DELETE
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    )
}

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useWatchlist } from '@/features/watchlist/application/hooks/useWatchlist'
import { useStockSearch } from '@/features/stock/application/hooks/useStockSearch'
import type { StockItem } from '@/features/stock/domain/model/stockItem'

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

export function MyWatchlistSection() {
    const { items, isLoading, error, add, remove } = useWatchlist()
    const { results, isLoading: isSearching, error: searchError, query, search, clear } = useStockSearch()
    const [registering, setRegistering] = useState<string | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<{ id: number; symbol: string; name: string } | null>(null)

    const handleRegister = async (item: StockItem) => {
        setRegistering(item.symbol)
        const ok = await add(item.symbol, item.name, item.market)
        setRegistering(null)
        if (ok) clear()
    }

    return (
        <section id="watchlist" className="scroll-mt-24 border border-outline bg-surface-container-low px-5 py-4">
            <div className="mb-3 font-mono text-xs font-bold text-on-surface uppercase tracking-widest">
                MY_WATCHLIST
                <span className="ml-2 font-normal text-outline">({items.length})</span>
            </div>

            {/* 종목 검색 */}
            <div className="relative mb-4">
                <div className="flex items-center gap-2 px-3 py-2 border border-outline bg-surface-container-lowest focus-within:border-primary">
                    <span className="material-symbols-outlined text-[16px] text-outline shrink-0">search</span>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => search(e.target.value)}
                        placeholder="종목명 또는 코드 검색"
                        className="flex-1 bg-transparent outline-none font-mono text-sm text-on-surface placeholder:text-outline"
                    />
                    {isSearching ? (
                        <span className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin shrink-0" />
                    ) : query.length > 0 ? (
                        <button type="button" onClick={clear} className="shrink-0 text-outline hover:text-on-surface">
                            <span className="material-symbols-outlined text-[16px]">close</span>
                        </button>
                    ) : null}
                </div>

                {searchError && <p className="mt-1 font-mono text-xs text-error">{searchError}</p>}
                {query.length > 0 && !isSearching && results.length === 0 && !searchError && (
                    <p className="mt-1 font-mono text-xs text-outline">검색 결과가 없습니다.</p>
                )}

                {results.length > 0 && (
                    <ul className="absolute z-50 w-full mt-0 bg-surface-container-lowest border border-primary/40 shadow-lg max-h-52 overflow-y-auto">
                        {results.map((item) => (
                            <li key={item.symbol} className="border-b border-outline-variant last:border-b-0">
                                <button
                                    type="button"
                                    onClick={() => handleRegister(item)}
                                    disabled={registering === item.symbol}
                                    className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-primary/15 text-left disabled:opacity-50"
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-xs text-outline w-14">{item.symbol}</span>
                                        <span className="font-mono text-sm text-on-surface">{item.name}</span>
                                        <MarketBadge market={item.market} />
                                    </div>
                                    <span className="font-mono text-xs text-primary font-bold uppercase shrink-0">
                                        {registering === item.symbol ? 'ADDING...' : '+ ADD'}
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {error && (
                <p className="mb-3 font-mono text-xs text-error">[ERROR] {error}</p>
            )}

            {/* 목록 */}
            {isLoading ? (
                <div className="space-y-2">
                    {[1, 2, 3].map((i) => <div key={i} className="h-10 bg-surface-container animate-pulse" />)}
                </div>
            ) : items.length === 0 ? (
                <p className="font-mono text-sm text-outline text-center py-6 border border-dashed border-outline">
                    관심종목을 검색해서 추가해보세요.
                </p>
            ) : (
                <ul className="space-y-1.5">
                    {items.map((item) => (
                        <li key={item.id} className="flex items-center justify-between px-3 py-2.5 border border-outline">
                            <div className="flex items-center gap-3 min-w-0">
                                <Link href={`/stock/${item.symbol}`} className="font-mono text-xs text-outline hover:text-primary shrink-0">
                                    {item.symbol}
                                </Link>
                                <Link href={`/stock/${item.symbol}`} className="font-mono text-sm text-on-surface hover:text-primary truncate">
                                    {item.name}
                                </Link>
                                <MarketBadge market={item.market} />
                            </div>
                            <button
                                type="button"
                                onClick={() => setDeleteTarget({ id: item.id, symbol: item.symbol, name: item.name })}
                                className="shrink-0 font-mono text-xs text-error border border-outline px-2 py-1 hover:bg-error hover:text-white hover:border-error uppercase"
                            >
                                DEL
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            {/* 삭제 확인 모달 */}
            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <button
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={() => setDeleteTarget(null)}
                        aria-label="닫기"
                    />
                    <div className="relative z-10 w-full max-w-sm mx-4 border border-primary/40 bg-surface-container-lowest p-6 shadow-lg">
                        <div className="font-mono text-xs font-bold text-error uppercase tracking-widest mb-4">
                            ⚠ CONFIRM_DELETE
                        </div>
                        <div className="font-mono text-sm text-on-surface-variant border border-outline-variant px-3 py-2 mb-5">
                            <span className="text-outline mr-2">{deleteTarget.symbol}</span>
                            <span className="font-bold text-on-surface">{deleteTarget.name}</span>
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setDeleteTarget(null)}
                                className="flex-1 font-mono text-sm border border-outline-variant px-3 py-2 text-on-surface-variant hover:bg-surface-container uppercase"
                            >
                                CANCEL
                            </button>
                            <button
                                type="button"
                                onClick={() => { remove(deleteTarget.id); setDeleteTarget(null) }}
                                className="flex-1 font-mono text-sm border border-error bg-error text-white px-3 py-2 hover:opacity-90 uppercase font-bold"
                            >
                                DELETE
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    )
}

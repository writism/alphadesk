"use client"

import { ClientPaginationBar } from "@/app/components/ClientPaginationBar"
import type { WatchlistItem } from "@/features/watchlist/domain/model/watchlistItem"
import {
    DASHBOARD_WATCHLIST_GRID_PAGE_SIZE,
    useClientPagination,
} from "@/features/shared/application/hooks/useClientPagination"
import { MarketBadge } from "./dashboardBadges"

type Props = {
    items: WatchlistItem[]
    isWatchlistLoading: boolean
    watchlistError: string | null
    selectedSymbols: string[]
    allSelected: boolean
    selectedCount: number
    running: boolean
    onSelectAll: (checked: boolean) => void
    onSelectSymbol: (symbol: string, checked: boolean) => void
}

export function DashboardWatchlistSection({
    items,
    isWatchlistLoading,
    watchlistError,
    selectedSymbols,
    allSelected,
    selectedCount,
    running,
    onSelectAll,
    onSelectSymbol,
}: Props) {
    const {
        page: gridPage,
        totalPages: gridTotalPages,
        pageItems: pagedItems,
        setPage: setGridPage,
        rangeStart: gridRangeStart,
        rangeEnd: gridRangeEnd,
        totalItems: gridPageTotal,
        showPagination: gridShowPagination,
    } = useClientPagination(items, DASHBOARD_WATCHLIST_GRID_PAGE_SIZE)

    return (
        <section className="mb-10" aria-label="관심종목 목록">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">
                    관심종목 <span className="text-sm font-normal text-gray-500">({items.length})</span>
                </h2>

                {items.length > 0 && (
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={allSelected}
                                disabled={running}
                                onChange={(e) => onSelectAll(e.target.checked)}
                                aria-label="관심종목 전체 선택"
                            />
                            <span>전체 선택</span>
                        </label>
                        <span aria-live="polite">
                            선택 {selectedCount}/{items.length}
                        </span>
                    </div>
                )}
            </div>

            {watchlistError && <p className="mb-2 text-sm text-red-500">{watchlistError}</p>}

            {isWatchlistLoading ? (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div
                            key={i}
                            className="h-[5.25rem] rounded-lg bg-gray-100 animate-pulse sm:h-24 dark:bg-gray-800"
                        />
                    ))}
                </div>
            ) : items.length === 0 ? (
                <p className="text-gray-500 py-6 text-center border border-dashed border-gray-300 rounded-lg dark:border-gray-600">
                    등록된 관심종목이 없습니다.{" "}
                    <a href="/watchlist" className="text-blue-500 underline hover:text-blue-700">
                        관심종목 등록하기
                    </a>
                </p>
            ) : (
                <>
                    <div
                        className={`grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4 ${running ? "opacity-70" : ""}`}
                    >
                        {pagedItems.map((item) => {
                            const selected = selectedSymbols.includes(item.symbol)
                            return (
                                <div
                                    key={item.id}
                                    className={`flex min-w-0 w-full flex-col gap-1.5 rounded-lg border px-2.5 py-2 transition-colors sm:gap-2 sm:px-3 sm:py-2.5 ${
                                        selected
                                            ? "border-blue-500 bg-blue-50/60 dark:border-blue-400 dark:bg-blue-950/30"
                                            : "border-gray-200 dark:border-gray-700"
                                    }`}
                                >
                                    <div className="flex shrink-0 flex-wrap items-center gap-x-1.5 gap-y-0.5 sm:gap-x-2 sm:gap-y-1">
                                        <input
                                            type="checkbox"
                                            checked={selected}
                                            disabled={running}
                                            onChange={(e) => onSelectSymbol(item.symbol, e.target.checked)}
                                            aria-label={`${item.symbol} ${item.name} 분석 대상 선택`}
                                        />
                                        <span className="font-mono text-xs font-semibold text-gray-500 tabular-nums sm:text-sm">
                                            {item.symbol}
                                        </span>
                                        <span className="shrink-0">
                                            <MarketBadge market={item.market} />
                                        </span>
                                    </div>
                                    <p className="text-xs font-medium leading-snug text-foreground line-clamp-2 break-words sm:text-sm sm:line-clamp-3">
                                        {item.name}
                                    </p>
                                </div>
                            )
                        })}
                    </div>
                    {gridShowPagination ? (
                        <ClientPaginationBar
                            page={gridPage}
                            totalPages={gridTotalPages}
                            onPageChange={setGridPage}
                            rangeStart={gridRangeStart}
                            rangeEnd={gridRangeEnd}
                            totalItems={gridPageTotal}
                            className="mt-4"
                        />
                    ) : null}
                </>
            )}
        </section>
    )
}

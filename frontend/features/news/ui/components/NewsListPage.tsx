"use client"

import Link from "next/link"
import { getSafeUrl } from "@/infrastructure/utils/urlValidator"
import { memo, useMemo, useState } from "react"
import { ClientPaginationBar } from "@/app/components/ClientPaginationBar"
import { useNewsList, type MarketFilter, type SaveResult } from "@/features/news/application/hooks/useNewsList"
import type { NewsArticleItem } from "@/features/news/domain/model/newsArticle"

type SortOrder = "newest" | "oldest"
type SaveState = "idle" | "saving" | SaveResult

// 큰 뉴스 리스트에서 상위 상태가 변해도 각 행이 불필요하게 리렌더되지 않도록 memo 로 분리한다.
// `article` 참조·`onSave` 참조가 안정적이면(훅이 useCallback 으로 반환) 재랜더를 건너뛴다.
const NewsItem = memo(function NewsItem({
    article,
    onSave,
}: {
    article: NewsArticleItem
    onSave: (article: NewsArticleItem) => Promise<SaveResult>
}) {
    const [saveState, setSaveState] = useState<SaveState>("idle")

    const handleSave = async () => {
        if (saveState !== "idle") return
        setSaveState("saving")
        const result = await onSave(article)
        setSaveState(result)
    }

    const saveLabel: Record<SaveState, string> = {
        idle: "SAVE",
        saving: "SAVING...",
        ok: "SAVED",
        duplicate: "ALREADY SAVED",
        unauthenticated: "LOGIN REQUIRED",
        error: "ERROR",
    }

    const saveCls: Record<SaveState, string> = {
        idle: "border-outline text-on-surface-variant hover:bg-primary hover:text-white hover:border-primary",
        saving: "border-outline text-outline cursor-not-allowed opacity-50",
        ok: "border-primary text-primary",
        duplicate: "border-outline-variant text-outline",
        unauthenticated: "border-error text-error",
        error: "border-error text-error",
    }

    return (
        <li className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between border border-outline px-4 py-3">
            <div className="flex flex-col gap-1 min-w-0 flex-1">
                <a
                    href={getSafeUrl(article.link)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-sm font-medium text-on-surface hover:text-primary line-clamp-2"
                >
                    {article.title}
                </a>
                {article.snippet && (
                    <p className="font-mono text-xs text-on-surface-variant line-clamp-2">{article.snippet}</p>
                )}
                <div className="flex gap-3 font-mono text-xs text-outline">
                    <span>{article.source}</span>
                    {article.published_at && <span>{article.published_at}</span>}
                </div>
            </div>
            <button
                type="button"
                disabled={saveState === "saving"}
                onClick={handleSave}
                className={`shrink-0 font-mono text-xs px-3 py-1.5 border uppercase font-bold transition-none ${saveCls[saveState]}`}
            >
                {saveLabel[saveState]}
            </button>
        </li>
    )
})

const MARKET_OPTIONS: { value: MarketFilter; label: string }[] = [
    { value: "ALL", label: "ALL" },
    { value: "KR", label: "KR" },
    { value: "US", label: "US" },
]

export function NewsListPage() {
    const {
        items,
        totalCount,
        page,
        pageSize,
        isLoading,
        error,
        totalPages,
        rangeStart,
        rangeEnd,
        marketFilter,
        changeMarket,
        changePage,
        save,
    } = useNewsList()

    const [titleQuery, setTitleQuery] = useState("")
    const [sortOrder, setSortOrder] = useState<SortOrder>("newest")

    const filteredItems = useMemo(() => {
        let result = items

        if (titleQuery.trim()) {
            const q = titleQuery.trim().toLowerCase()
            result = result.filter(
                (a) =>
                    a.title.toLowerCase().includes(q) ||
                    (a.snippet ?? "").toLowerCase().includes(q),
            )
        }

        result = [...result].sort((a, b) => {
            const da = a.published_at ? new Date(a.published_at).getTime() : 0
            const db = b.published_at ? new Date(b.published_at).getTime() : 0
            return sortOrder === "newest" ? db - da : da - db
        })

        return result
    }, [items, titleQuery, sortOrder])

    return (
        <main className="max-w-5xl mx-auto px-6 md:px-8 pt-6 pb-24 md:pb-8">
            {/* Header */}
            <div className="mb-4 border-b border-outline pb-4">
                <div className="flex items-center justify-between gap-4">
                    <div className="font-headline font-bold text-on-surface text-xl uppercase tracking-tighter">
                        NEWS
                    </div>
                    <Link
                        href="/news/saved"
                        className="font-mono text-xs border border-outline px-2 py-0.5 text-on-surface-variant hover:text-primary hover:border-primary"
                    >
                        SAVED_ARTICLES →
                    </Link>
                </div>
                <div className="font-mono text-sm text-on-surface-variant mt-0.5">
                    관심종목 기반 주식 뉴스
                </div>
            </div>

            {/* Filter bar */}
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                {/* Market toggle */}
                <div className="flex gap-0 border border-outline shrink-0">
                    {MARKET_OPTIONS.map((opt) => (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => changeMarket(opt.value)}
                            className={`font-mono text-xs px-3 py-1.5 uppercase font-bold border-r last:border-r-0 border-outline transition-none ${
                                marketFilter === opt.value
                                    ? "bg-primary text-white"
                                    : "text-on-surface-variant hover:text-primary"
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>

                {/* Title search */}
                <input
                    type="text"
                    placeholder="SEARCH TITLE..."
                    value={titleQuery}
                    onChange={(e) => setTitleQuery(e.target.value)}
                    className="flex-1 font-mono text-xs bg-transparent border border-outline px-3 py-1.5 text-on-surface placeholder:text-outline focus:outline-none focus:border-primary"
                />

                {/* Sort toggle */}
                <button
                    type="button"
                    onClick={() => setSortOrder((s) => (s === "newest" ? "oldest" : "newest"))}
                    className="shrink-0 font-mono text-xs border border-outline px-3 py-1.5 text-on-surface-variant hover:text-primary hover:border-primary uppercase font-bold"
                >
                    {sortOrder === "newest" ? "DATE ↓" : "DATE ↑"}
                </button>
            </div>

            {error && (
                <div className="mb-4 px-3 py-2 border border-outline font-mono text-sm text-error">
                    [ERROR] {error}
                </div>
            )}

            {isLoading ? (
                <ul className="flex flex-col gap-2">
                    {Array.from({ length: pageSize }).map((_, i) => (
                        <li key={i} className="h-20 border border-outline bg-surface-container animate-pulse" />
                    ))}
                </ul>
            ) : !error && filteredItems.length === 0 ? (
                <p className="font-mono text-sm text-outline py-10 text-center border border-dashed border-outline">
                    {titleQuery ? "검색 결과가 없습니다." : "뉴스가 없습니다."}
                </p>
            ) : (
                <>
                    <div className="mb-2 font-mono text-xs text-outline">
                        {titleQuery
                            ? `${filteredItems.length} / ${items.length} RESULTS`
                            : `${rangeStart}–${rangeEnd} / ${totalCount} RESULTS`}
                    </div>
                    <ul className="flex flex-col gap-2">
                        {filteredItems.map((article, i) => (
                            <NewsItem
                                key={`${article.link ?? ""}-${i}`}
                                article={article}
                                onSave={save}
                            />
                        ))}
                    </ul>
                    {!titleQuery && totalCount > pageSize && (
                        <ClientPaginationBar
                            page={page}
                            totalPages={totalPages}
                            onPageChange={changePage}
                            rangeStart={rangeStart}
                            rangeEnd={rangeEnd}
                            totalItems={totalCount}
                            className="mt-4"
                        />
                    )}
                </>
            )}
        </main>
    )
}

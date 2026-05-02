"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { useAtomValue } from "jotai"
import { authStateAtom } from "@/features/auth/application/atoms/authAtom"
import { useBoardList } from "@/features/board/application/hooks/useBoardList"

type CategoryFilter = "ALL" | "AI_ANALYSIS" | "GENERAL"

export default function BoardPage() {
    const authState = useAtomValue(authStateAtom)
    const isAuthenticated = authState.status === "AUTHENTICATED"
    const { items, page, totalPages, isLoading, error, goToPage } = useBoardList()
    const [titleQuery, setTitleQuery] = useState("")
    const [category, setCategory] = useState<CategoryFilter>("ALL")

    const filteredItems = useMemo(() => {
        let result = items
        if (category === "AI_ANALYSIS") {
            result = result.filter((p) => p.shared_card_id != null)
        } else if (category === "GENERAL") {
            result = result.filter((p) => p.shared_card_id == null)
        }
        if (titleQuery.trim()) {
            const q = titleQuery.trim().toLowerCase()
            result = result.filter((p) => p.title.toLowerCase().includes(q))
        }
        return result
    }, [items, category, titleQuery])

    const CATEGORIES: { value: CategoryFilter; label: string }[] = [
        { value: "ALL", label: "ALL" },
        { value: "AI_ANALYSIS", label: "AI_ANALYSIS" },
        { value: "GENERAL", label: "GENERAL" },
    ]

    return (
        <>
        {/* Sticky 페이지 헤더 */}
        <div className="sticky top-0 z-40 bg-surface border-b border-outline">
            <div className="max-w-5xl mx-auto px-6 md:px-8 flex items-stretch justify-between">
                <div className="flex flex-col px-5 py-3 font-mono text-xs uppercase">
                    <span className="font-bold tracking-widest text-on-surface">BOARD</span>
                    <span className="text-[9px] text-on-surface-variant/60 normal-case mt-0.5">종목 분석·시황 관련 게시물</span>
                </div>
                {isAuthenticated && (
                    <div className="flex items-center pr-2">
                        <Link
                            href="/board/create"
                            className="inline-flex items-center gap-1.5 bg-primary px-3 py-1.5 font-mono text-[10px] text-white uppercase hover:opacity-90"
                        >
                            <span className="material-symbols-outlined text-[12px]">edit</span>
                            NEW_POST
                        </Link>
                    </div>
                )}
            </div>
        </div>
        <main className="max-w-5xl mx-auto px-6 md:px-8 pt-4 pb-24 md:pb-8">

            {/* 필터 바 */}
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                <div className="flex gap-0 border border-outline shrink-0">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.value}
                            type="button"
                            onClick={() => setCategory(cat.value)}
                            className={`font-mono text-[10px] px-3 py-1.5 uppercase font-bold border-r last:border-r-0 border-outline transition-none ${
                                category === cat.value
                                    ? "bg-primary text-white"
                                    : "text-on-surface-variant hover:text-primary"
                            }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
                <input
                    type="text"
                    placeholder="SEARCH TITLE..."
                    value={titleQuery}
                    onChange={(e) => setTitleQuery(e.target.value)}
                    className="flex-1 font-mono text-xs bg-transparent border border-outline px-3 py-1.5 text-on-surface placeholder:text-outline focus:outline-none focus:border-primary"
                />
            </div>

            <section aria-label="게시물 목록">
                {isLoading ? (
                    <div className="flex flex-col gap-2">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-14 bg-surface-container animate-pulse" />
                        ))}
                    </div>
                ) : error ? (
                    <div className="border border-outline px-4 py-3 font-mono text-sm text-error">
                        [ERROR] {error}
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="border border-dashed border-outline py-16 text-center">
                        <p className="font-mono text-sm text-on-surface-variant">
                            {titleQuery || category !== "ALL" ? "검색 결과가 없습니다." : "아직 게시물이 없습니다."}
                        </p>
                        {isAuthenticated && !titleQuery && category === "ALL" && (
                            <Link
                                href="/board/create"
                                className="mt-4 inline-block bg-primary px-4 py-1.5 font-mono text-[10px] text-white uppercase hover:opacity-90"
                            >
                                첫 게시물 작성하기
                            </Link>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="mb-2 font-mono text-xs text-outline">
                            {filteredItems.length} RESULTS
                        </div>
                        <ul className="flex flex-col divide-y divide-outline-variant border border-outline">
                            {filteredItems.map((post) => (
                                <li key={post.board_id}>
                                    <Link
                                        href={`/board/read/${post.board_id}`}
                                        className="flex items-center justify-between px-5 py-3.5 hover:bg-surface-container transition-none"
                                    >
                                        <div className="min-w-0">
                                            <p className="truncate font-mono text-sm font-medium text-on-surface flex items-center gap-2">
                                                {post.shared_card_id != null && (
                                                    <span className="shrink-0 border border-primary/50 px-1 py-0.5 text-[9px] uppercase text-primary font-bold">
                                                        AI
                                                    </span>
                                                )}
                                                <span className="truncate">{post.title}</span>
                                            </p>
                                            <p className="mt-0.5 font-mono text-xs text-outline">
                                                {post.nickname} · {new Date(post.created_at).toLocaleDateString("ko-KR")}
                                            </p>
                                        </div>
                                        <span className="material-symbols-outlined ml-3 text-[16px] shrink-0 text-outline">
                                            chevron_right
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>

                        {totalPages > 1 && !titleQuery && category === "ALL" && (
                            <div className="mt-6 flex justify-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => goToPage(page - 1)}
                                    disabled={page <= 1}
                                    className="border border-outline px-3 py-1 font-mono text-[11px] disabled:opacity-40 hover:bg-surface-container uppercase"
                                >
                                    PREV
                                </button>
                                <span className="px-3 py-1 font-mono text-[11px] text-on-surface-variant">
                                    {page} / {totalPages}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => goToPage(page + 1)}
                                    disabled={page >= totalPages}
                                    className="border border-outline px-3 py-1 font-mono text-[11px] disabled:opacity-40 hover:bg-surface-container uppercase"
                                >
                                    NEXT
                                </button>
                            </div>
                        )}
                    </>
                )}
            </section>

            {!isAuthenticated && (
                <div className="mt-6 flex items-center justify-between gap-4 border border-outline-variant bg-surface-container px-4 py-3">
                    <p className="font-mono text-xs text-on-surface-variant">
                        로그인하면 게시물을 직접 작성할 수 있습니다.
                    </p>
                    <Link
                        href="/login"
                        className="shrink-0 font-mono text-[10px] bg-primary text-white px-3 py-1.5 uppercase hover:opacity-90"
                    >
                        로그인 →
                    </Link>
                </div>
            )}
        </main>
        </>
    )
}

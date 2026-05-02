"use client"

import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import dynamic from "next/dynamic"
import useSWR from "swr"
import { useBoardRead } from "@/features/board/application/hooks/useBoardRead"
import { useAtomValue } from "jotai"
import { authStateAtom } from "@/features/auth/application/atoms/authAtom"
import { fetchSharedCard } from "@/features/share/infrastructure/api/shareApi"
import type { HeatmapItem } from "@/features/stock/domain/model/dailyReturnsHeatmap"
import { useRecordRecentlyViewed } from "@/features/profile/application/hooks/useRecordRecentlyViewed"

// 조건부로만 렌더되는 무거운 패널들은 코드 스플릿으로 첫 페이로드에서 분리한다.
const StockSummaryCard = dynamic(() => import("@/app/components/StockSummaryCard"), {
    loading: () => (
        <div className="mb-8 h-48 rounded-lg border border-gray-200 animate-pulse bg-gray-100 dark:border-gray-700 dark:bg-gray-800" />
    ),
})
const ShareActionBar = dynamic(
    () => import("@/features/share/ui/components/ShareActionBar").then((m) => m.ShareActionBar),
)

function isSentiment(v: string): v is "POSITIVE" | "NEGATIVE" | "NEUTRAL" {
    return v === "POSITIVE" || v === "NEGATIVE" || v === "NEUTRAL"
}

function isSourceType(v: string): v is "NEWS" | "DISCLOSURE" | "REPORT" {
    return v === "NEWS" || v === "DISCLOSURE" || v === "REPORT"
}

type HeatmapResponse = {
    items?: Record<string, HeatmapItem | undefined>
}

async function fetchHeatmapForSymbol(symbol: string): Promise<HeatmapItem | null> {
    const sym = symbol.trim().toUpperCase()
    const r = await fetch(`/api/stocks/daily-returns-heatmap?symbols=${encodeURIComponent(sym)}&weeks=8`)
    if (!r.ok) return null
    const data = (await r.json()) as HeatmapResponse
    return data.items?.[sym] ?? null
}

export default function BoardReadPage() {
    const params = useParams()
    const router = useRouter()
    const boardId = Number(params.id)
    const authState = useAtomValue(authStateAtom)
    const isAuthenticated = authState.status === "AUTHENTICATED"
    const currentNickname = authState.status === "AUTHENTICATED" ? authState.user.nickname : null
    const currentAccountId =
        authState.status === "AUTHENTICATED" ? authState.user.accountId : ""

    const { post, isLoading, error, isDeleting, deletePost } = useBoardRead(boardId)
    const recordRecentlyViewed = useRecordRecentlyViewed()

    const linkedCardId = post?.shared_card_id ?? null

    const { data: sharedCard, isLoading: cardLoading } = useSWR(
        linkedCardId != null ? ["board-shared-card", linkedCardId] : null,
        () => {
            if (linkedCardId == null) throw new Error("linkedCardId required")
            return fetchSharedCard(linkedCardId)
        }
    )

    const heatmapSymbol = sharedCard?.symbol?.trim().toUpperCase() ?? null
    const { data: heatmapItem } = useSWR(
        heatmapSymbol ? ["board-heatmap", heatmapSymbol] : null,
        () => {
            if (!heatmapSymbol) throw new Error("heatmapSymbol required")
            return fetchHeatmapForSymbol(heatmapSymbol)
        }
    )

    useEffect(() => {
        if (!sharedCard || sharedCard.symbol === "BOARD" || !post?.shared_card_id) return
        recordRecentlyViewed({ symbol: sharedCard.symbol, name: sharedCard.name })
    }, [sharedCard?.symbol, sharedCard?.name, post?.shared_card_id, recordRecentlyViewed])

    const handleDelete = async () => {
        if (!confirm("게시물을 삭제하시겠습니까?")) return
        const ok = await deletePost()
        if (ok) router.push("/board")
    }

    if (isLoading) {
        return (
            <main className="min-h-screen bg-background text-foreground p-6 md:p-10 max-w-3xl mx-auto">
                <div className="h-8 w-48 rounded bg-gray-200 dark:bg-gray-700 animate-pulse mb-4" />
                <div className="h-4 w-32 rounded bg-gray-100 dark:bg-gray-800 animate-pulse mb-8" />
                <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-4 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
                    ))}
                </div>
            </main>
        )
    }

    if (error || !post) {
        return (
            <main className="min-h-screen bg-background text-foreground p-6 md:p-10 max-w-3xl mx-auto">
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300 mb-6">
                    {error ?? "게시물을 찾을 수 없습니다."}
                </div>
                <Link
                    href="/board"
                    className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                >
                    ← 게시판으로 돌아가기
                </Link>
            </main>
        )
    }

    const hasLinkedCard = Boolean(post.shared_card_id)
    const isAiCard = hasLinkedCard && sharedCard != null && sharedCard.symbol !== "BOARD"
    const isBoardCard = hasLinkedCard && sharedCard != null && sharedCard.symbol === "BOARD"
    const showExtraBody =
        isAiCard &&
        sharedCard != null &&
        post.content.trim() !== sharedCard.summary.trim()
    const cardLoadFailed = hasLinkedCard && !cardLoading && sharedCard === undefined

    const isCardOwner =
        isAuthenticated &&
        sharedCard != null &&
        currentAccountId !== "" &&
        String(sharedCard.sharer_account_id) === String(currentAccountId)

    return (
        <main className="min-h-screen bg-background text-foreground p-6 md:p-10 max-w-3xl mx-auto">
            <article>
                <header className="mb-6 border-b border-gray-200 pb-4 dark:border-gray-700">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 break-keep">
                        {post.title}
                    </h1>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                        {isAiCard && (
                            <span className="rounded border border-amber-600/50 px-1.5 py-0.5 text-[10px] font-mono uppercase text-amber-600 dark:text-amber-400">
                                AI 분석 카드
                            </span>
                        )}
                        <span>{post.nickname}</span>
                        <span>·</span>
                        <time dateTime={post.created_at}>
                            {new Date(post.created_at).toLocaleString("ko-KR", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                        </time>
                        {post.updated_at && post.updated_at !== post.created_at && (
                            <>
                                <span>·</span>
                                <span className="text-xs">
                                    수정됨{" "}
                                    {new Date(post.updated_at).toLocaleString("ko-KR", {
                                        month: "long",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </span>
                            </>
                        )}
                    </div>
                </header>

                {hasLinkedCard && cardLoading && (
                    <div className="mb-8 h-48 rounded-lg border border-gray-200 animate-pulse bg-gray-100 dark:border-gray-700 dark:bg-gray-800" />
                )}

                {isAiCard && sharedCard && (
                    <section className="mb-8" aria-label="연결된 AI 분석 카드">
                        <StockSummaryCard
                            symbol={sharedCard.symbol}
                            name={sharedCard.name}
                            summary={sharedCard.summary}
                            tags={sharedCard.tags.map((t) => ({ label: t }))}
                            sentiment={isSentiment(sharedCard.sentiment) ? sharedCard.sentiment : "NEUTRAL"}
                            sentiment_score={sharedCard.sentiment_score}
                            confidence={sharedCard.confidence}
                            source_type={isSourceType(sharedCard.source_type) ? sharedCard.source_type : "NEWS"}
                            url={sharedCard.url ?? undefined}
                            heatmap={
                                heatmapItem ? { item: heatmapItem, weeks: 8, asOf: null } : undefined
                            }
                            analyzed_at={sharedCard.analyzed_at}
                            isLoggedIn={isAuthenticated}
                            sharedCardId={sharedCard.id}
                            sharedCardLikeCount={sharedCard.like_count}
                            sharedCardCommentCount={sharedCard.comment_count}
                            initialUserHasLiked={sharedCard.user_has_liked}
                            snsShareEnabled={isCardOwner}
                            showBoardPublishButton={false}
                        />
                    </section>
                )}

                {/* 일반 게시물 본문 (카드 스타일) */}
                {(isBoardCard || !hasLinkedCard || cardLoadFailed) && (
                    <section className="mb-8">
                        <div className="border border-outline bg-surface-container-low p-5">
                            <div className="prose prose-sm max-w-none text-on-surface leading-7 whitespace-pre-wrap font-mono text-sm">
                                {cardLoadFailed && (
                                    <p className="text-xs text-amber-600 dark:text-amber-400 mb-2">
                                        연결된 분석 카드를 불러오지 못했습니다.
                                    </p>
                                )}
                                {post.content}
                            </div>
                        </div>
                    </section>
                )}

                {showExtraBody && (
                    <div className="mb-8 prose prose-sm max-w-none text-gray-800 dark:text-gray-200 leading-7 whitespace-pre-wrap">
                        <p className="text-xs font-mono text-gray-500 dark:text-gray-400 mb-2">
                            작성자 본문
                        </p>
                        {post.content}
                    </div>
                )}

                {/* 좋아요 / 댓글 — AI카드가 아닌 일반 게시물에서도 동작 */}
                {hasLinkedCard && !cardLoading && sharedCard && !isAiCard && (
                    <ShareActionBar
                        cardId={sharedCard.id}
                        initialLikeCount={sharedCard.like_count}
                        initialCommentCount={sharedCard.comment_count}
                        initialUserHasLiked={sharedCard.user_has_liked}
                        isLoggedIn={isAuthenticated}
                        snsShareEnabled={false}
                        showBoardPublish={false}
                    />
                )}
            </article>

            <footer className="mt-10 flex flex-wrap items-center gap-3 border-t border-gray-200 pt-6 dark:border-gray-700">
                <Link
                    href="/board"
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                    목록으로
                </Link>

                {isAuthenticated && currentNickname === post.nickname && (
                    <>
                        <Link
                            href={`/board/edit/${post.board_id}`}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                            수정
                        </Link>
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950"
                        >
                            {isDeleting ? "삭제 중..." : "삭제"}
                        </button>
                    </>
                )}
            </footer>
        </main>
    )
}

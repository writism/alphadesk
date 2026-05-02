"use client"

import { useState } from "react"
import { useSharedCards } from "../../application/hooks/useSharedCards"
import { useCardActions } from "../../application/hooks/useCardActions"
import { CommentModal } from "./CommentModal"
import { deleteSharedCard } from "../../infrastructure/api/shareApi"
import { getAccountIdCookie } from "../../infrastructure/utils/guestName"
import type { SharedCard } from "../../domain/model/sharedCard"

const SENTIMENT_LABEL: Record<string, string> = {
    POSITIVE: "긍정",
    NEGATIVE: "부정",
    NEUTRAL: "중립",
}
const SENTIMENT_COLOR: Record<string, string> = {
    POSITIVE: "text-green-400",
    NEGATIVE: "text-red-400",
    NEUTRAL: "text-gray-400",
}

function SharedCardItem({ card, onReload }: { card: SharedCard; onReload: () => void }) {
    const {
        likeCount, liked, handleLike,
        comments, commentLoading,
        loadComments, handleAddComment,
    } = useCardActions(card.id, card.like_count, card.user_has_liked, card.comment_count)
    const [commentOpen, setCommentOpen] = useState(false)
    const [deleting, setDeleting] = useState(false)

    const isOwner = card.sharer_account_id !== null &&
        card.sharer_account_id === Number(getAccountIdCookie())

    const handleCommentSubmit = async (content: string, nickname: string) => {
        await handleAddComment(content, nickname)
        onReload()
    }

    const handleDelete = async () => {
        if (!confirm("이 카드의 공유를 취소할까요?")) return
        setDeleting(true)
        try {
            await deleteSharedCard(card.id)
            onReload()
        } catch {
            // 삭제 실패 시 사용자에게 피드백 없이 버튼 상태만 복구
        } finally {
            setDeleting(false)
        }
    }

    return (
        <div className="rounded-xl border border-gray-700 bg-gray-800/60 p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-2">
                    <span className="font-bold text-gray-100">{card.symbol}</span>
                    <span className="text-sm text-gray-400">{card.name}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold ${SENTIMENT_COLOR[card.sentiment] ?? "text-gray-400"}`}>
                        {SENTIMENT_LABEL[card.sentiment] ?? card.sentiment}{" "}
                        {card.sentiment_score > 0 ? "+" : ""}{card.sentiment_score.toFixed(2)}
                    </span>
                    {isOwner && (
                        <button
                            onClick={handleDelete}
                            disabled={deleting}
                            className="text-xs text-gray-500 hover:text-red-400 transition disabled:opacity-40"
                            title="공유 취소"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>

            <p className="text-sm text-gray-300 line-clamp-2 leading-relaxed">{card.summary}</p>

            <div className="flex items-center gap-3 mt-1">
                <button
                    onClick={handleLike}
                    className={`flex items-center gap-1 text-xs transition ${liked ? "text-red-400" : "text-gray-500 hover:text-red-400"}`}
                >
                    {liked ? "❤️" : "🤍"} {likeCount}
                </button>
                <button
                    onClick={() => setCommentOpen(true)}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-400 transition"
                >
                    💬 {card.comment_count}
                </button>
                <span className="ml-auto text-xs text-gray-500">
                    by {card.sharer_nickname} · {new Date(card.created_at).toLocaleDateString("ko-KR")}
                </span>
            </div>

            <CommentModal
                cardId={card.id}
                open={commentOpen}
                comments={comments}
                loading={commentLoading}
                onOpen={loadComments}
                onClose={() => setCommentOpen(false)}
                onSubmit={handleCommentSubmit}
            />
        </div>
    )
}

export function SharedCardFeed() {
    const { cards, loading, error, reload } = useSharedCards(10)

    if (loading) {
        return (
            <section className="mt-8">
                <h2 className="mb-3 text-base font-semibold text-gray-200">공유된 AI 분석</h2>
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-24 rounded-xl bg-gray-800 animate-pulse" />
                    ))}
                </div>
            </section>
        )
    }

    if (error) return (
        <section className="mt-8">
            <h2 className="mb-3 text-base font-semibold text-gray-200">공유된 AI 분석</h2>
            <p className="text-sm text-gray-500">공유 카드를 불러오지 못했습니다.</p>
        </section>
    )

    if (cards.length === 0) return null

    return (
        <section className="mt-8">
            <h2 className="mb-3 text-base font-semibold text-gray-200">공유된 AI 분석</h2>
            <div className="space-y-3">
                {cards.map((card) => (
                    <SharedCardItem key={card.id} card={card} onReload={reload} />
                ))}
            </div>
        </section>
    )
}

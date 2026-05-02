"use client"

import Link from "next/link"
import { useState } from "react"
import type { SharedCard } from "@/features/share/domain/model/sharedCard"
import { useCardActions } from "@/features/share/application/hooks/useCardActions"
import { CommentModal } from "@/features/share/ui/components/CommentModal"
import { SNSShareModal } from "@/features/share/ui/components/SNSShareModal"

const SENTIMENT_LABEL: Record<string, string> = { POSITIVE: "긍정", NEGATIVE: "부정", NEUTRAL: "중립" }
const SENTIMENT_COLOR: Record<string, string> = {
    POSITIVE: "bg-green-900/50 text-green-300",
    NEGATIVE: "bg-red-900/50 text-red-300",
    NEUTRAL: "bg-gray-700 text-gray-300",
}

interface Props {
    card: SharedCard
}

export function SharePublicView({ card }: Props) {
    const {
        likeCount, liked, handleLike,
        comments, commentCount, commentLoading,
        loadComments, handleAddComment,
    } = useCardActions(card.id, card.like_count, card.user_has_liked)

    const [commentOpen, setCommentOpen] = useState(false)
    const [shareOpen, setShareOpen] = useState(false)

    return (
        <main className="mx-auto max-w-lg px-4 py-10">
            <div className="mb-6 flex items-center justify-between">
                <Link href="/" className="text-sm text-gray-400 hover:text-gray-200">
                    ← Alpha Terminal
                </Link>
                <span className="text-xs text-gray-500">
                    {card.sharer_nickname} 공유 · {new Date(card.created_at).toLocaleDateString("ko-KR")}
                </span>
            </div>

            {/* 카드 */}
            <div className="rounded-2xl border border-gray-700 bg-gray-800 p-6 shadow-xl">
                <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                        <span className="text-xl font-bold text-gray-100">{card.symbol}</span>
                        <span className="ml-2 text-sm text-gray-400">{card.name}</span>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${SENTIMENT_COLOR[card.sentiment] ?? "bg-gray-700 text-gray-300"}`}>
                        {SENTIMENT_LABEL[card.sentiment] ?? card.sentiment}{" "}
                        {card.sentiment_score > 0 ? "+" : ""}{card.sentiment_score.toFixed(2)}
                    </span>
                </div>

                <p className="mb-4 text-sm leading-relaxed text-gray-300">{card.summary}</p>

                {card.tags.length > 0 && (
                    <div className="mb-4 flex flex-wrap gap-2">
                        {card.tags.map((tag) => (
                            <span key={tag} className="rounded-full bg-blue-900/50 px-2 py-0.5 text-xs text-blue-300">
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                <div className="mb-4">
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                        <span>신뢰도</span>
                        <span>{Math.round(card.confidence * 100)}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-gray-700">
                        <div
                            className="h-full rounded-full bg-blue-400"
                            style={{ width: `${card.confidence * 100}%` }}
                        />
                    </div>
                </div>

                {card.url && (
                    <a
                        href={card.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mb-4 block text-xs text-blue-400 hover:underline"
                    >
                        원문 보기 →
                    </a>
                )}

                {/* 액션 바 */}
                <div className="flex items-center gap-4 border-t border-gray-700 pt-4">
                    <button
                        onClick={handleLike}
                        className={`flex items-center gap-1.5 text-sm transition ${liked ? "text-red-400" : "text-gray-400 hover:text-red-400"}`}
                    >
                        {liked ? "❤️" : "🤍"} {likeCount}
                    </button>
                    <button
                        onClick={() => setCommentOpen(true)}
                        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-blue-400 transition"
                    >
                        💬 {commentCount || card.comment_count}
                    </button>
                    <button
                        onClick={() => setShareOpen(true)}
                        className="ml-auto flex items-center gap-1.5 text-sm text-gray-400 hover:text-green-400 transition"
                    >
                        ↗️ 공유
                    </button>
                </div>
            </div>

            <div className="mt-6 text-center">
                <Link
                    href="/dashboard"
                    className="rounded-full bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
                >
                    Alpha Terminal에서 분석 보기
                </Link>
            </div>

            <CommentModal
                cardId={card.id}
                open={commentOpen}
                comments={comments}
                loading={commentLoading}
                onOpen={loadComments}
                onClose={() => setCommentOpen(false)}
                onSubmit={handleAddComment}
            />

            <SNSShareModal
                open={shareOpen}
                onClose={() => setShareOpen(false)}
                cardId={card.id}
                symbol={card.symbol}
                name={card.name}
                summary={card.summary}
            />
        </main>
    )
}

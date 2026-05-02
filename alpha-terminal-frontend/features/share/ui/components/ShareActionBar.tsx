"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { ShareCardPayload } from "../../domain/model/sharedCard"
import { useCardActions } from "../../application/hooks/useCardActions"
import { shareCard } from "../../infrastructure/api/shareApi"
import { createBoardPost } from "@/features/board/infrastructure/api/boardApi"
import { CommentModal } from "./CommentModal"
import { SNSShareModal } from "./SNSShareModal"

interface Props {
    cardId?: number
    sharePayload?: ShareCardPayload
    initialLikeCount?: number
    initialCommentCount?: number
    initialUserHasLiked?: boolean
    isLoggedIn?: boolean
    /** false면 SNS·링크 공유 버튼 숨김 (게시판 열람자 등) */
    snsShareEnabled?: boolean
    /** true면 대시보드 등에서 게시판 등록 버튼 표시 */
    showBoardPublish?: boolean
}

export function ShareActionBar({
    cardId: initialCardId,
    sharePayload,
    initialLikeCount = 0,
    initialCommentCount = 0,
    initialUserHasLiked = false,
    isLoggedIn = false,
    snsShareEnabled = true,
    showBoardPublish = false,
}: Props) {
    const router = useRouter()
    const [cardId, setCardId] = useState<number | undefined>(initialCardId)

    useEffect(() => {
        setCardId(initialCardId)
    }, [initialCardId])
    const [sharing, setSharing] = useState(false)
    const [publishingBoard, setPublishingBoard] = useState(false)
    const [shareError, setShareError] = useState<string | null>(null)
    const [boardError, setBoardError] = useState<string | null>(null)
    const [commentOpen, setCommentOpen] = useState(false)
    const [shareModalOpen, setShareModalOpen] = useState(false)

    const effectiveCardId = cardId ?? -1
    const {
        likeCount,
        liked,
        handleLike,
        comments,
        commentCount,
        commentLoading,
        loadComments,
        handleAddComment,
    } = useCardActions(
        effectiveCardId,
        initialLikeCount,
        initialUserHasLiked,
        initialCommentCount
    )

    const handleShare = async () => {
        if (!isLoggedIn) {
            alert("로그인 후 공유할 수 있습니다.")
            return
        }
        if (cardId) {
            setShareModalOpen(true)
            return
        }
        if (!sharePayload) return
        setSharing(true)
        setShareError(null)
        try {
            const shared = await shareCard(sharePayload)
            setCardId(shared.id)
            setShareModalOpen(true)
        } catch (e) {
            setShareError(e instanceof Error ? e.message : "공유 실패")
        } finally {
            setSharing(false)
        }
    }

    const handlePublishToBoard = async () => {
        if (!isLoggedIn) {
            alert("로그인 후 게시판에 올릴 수 있습니다.")
            return
        }
        if (!sharePayload) return
        setPublishingBoard(true)
        setBoardError(null)
        try {
            let cid = cardId
            if (!cid) {
                const shared = await shareCard(sharePayload)
                cid = shared.id
                setCardId(shared.id)
            }
            const title = `[AI 분석] ${sharePayload.symbol} ${sharePayload.name}`.slice(0, 200)
            const content =
                sharePayload.summary.trim() ||
                `${sharePayload.symbol} AI 분석 요약이 없습니다. 아래 카드에서 확인하세요.`
            const created = await createBoardPost(title, content, cid)
            router.push(`/board/read/${created.board_id}`)
        } catch (e) {
            setBoardError(e instanceof Error ? e.message : "게시판 등록에 실패했습니다.")
        } finally {
            setPublishingBoard(false)
        }
    }

    const canOpenSnsModal = Boolean(cardId && sharePayload && snsShareEnabled)

    return (
        <>
            <div className="flex items-center gap-3 border-t border-outline pt-3 mt-1">
                <button
                    type="button"
                    onClick={() => cardId && handleLike()}
                    disabled={!cardId}
                    className={`flex items-center gap-1.5 text-sm transition ${
                        liked
                            ? "text-red-400"
                            : "text-gray-400 hover:text-red-400"
                    } disabled:opacity-40`}
                    aria-label="좋아요"
                >
                    <span className="text-base">{liked ? "❤️" : "🤍"}</span>
                    <span>{likeCount}</span>
                </button>

                <button
                    type="button"
                    onClick={() => {
                        if (!cardId) return
                        setCommentOpen(true)
                    }}
                    disabled={!cardId}
                    className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-blue-400 transition disabled:opacity-40"
                    aria-label="댓글"
                >
                    <span className="text-base">💬</span>
                    <span>{cardId ? commentCount : initialCommentCount}</span>
                </button>

                {snsShareEnabled && (
                    <button
                        type="button"
                        onClick={handleShare}
                        disabled={sharing}
                        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-green-400 transition disabled:opacity-40"
                        aria-label="SNS 공유"
                    >
                        <span className="text-base">↗️</span>
                        <span className="whitespace-nowrap">{sharing ? "..." : "SHARE"}</span>
                    </button>
                )}

                {showBoardPublish && (
                    <button
                        type="button"
                        onClick={handlePublishToBoard}
                        disabled={publishingBoard}
                        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-amber-300 transition disabled:opacity-40"
                        aria-label="게시판에 올리기"
                    >
                        <span className="text-base">📋</span>
                        <span className="whitespace-nowrap">{publishingBoard ? "..." : "BOARD"}</span>
                    </button>
                )}
            </div>

            {shareError && (
                <p className="mt-1 text-xs text-red-400">{shareError}</p>
            )}
            {boardError && (
                <p className="mt-1 text-xs text-red-400">{boardError}</p>
            )}

            {commentOpen && cardId && (
                <CommentModal
                    cardId={cardId}
                    open={commentOpen}
                    comments={comments}
                    loading={commentLoading}
                    onOpen={loadComments}
                    onClose={() => setCommentOpen(false)}
                    onSubmit={handleAddComment}
                />
            )}

            {shareModalOpen && canOpenSnsModal && cardId && sharePayload && (
                <SNSShareModal
                    open={shareModalOpen}
                    onClose={() => setShareModalOpen(false)}
                    cardId={cardId}
                    symbol={sharePayload.symbol}
                    name={sharePayload.name}
                    summary={sharePayload.summary}
                />
            )}
        </>
    )
}

"use client"

import { useCallback, useEffect, useState } from "react"
import type { CardComment } from "../../domain/model/sharedCard"
import {
    addComment,
    fetchComments,
    toggleLike,
} from "../../infrastructure/api/shareApi"
import { getOrCreateGuestId } from "../../infrastructure/utils/guestName"

export function useCardActions(
    cardId: number,
    initialLikeCount: number,
    initialLiked = false,
    initialCommentCount = 0
) {
    const [likeCount, setLikeCount] = useState(initialLikeCount)
    const [liked, setLiked] = useState(initialLiked)
    const [likeLoading, setLikeLoading] = useState(false)

    // 폴링으로 card props가 갱신될 때 로컬 상태 싱크
    useEffect(() => {
        if (!likeLoading) {
            setLikeCount(initialLikeCount)
            setLiked(initialLiked)
        }
    // likeLoading 제외: 액션 중에는 서버값으로 덮어쓰지 않음
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialLikeCount, initialLiked])

    const [comments, setComments] = useState<CardComment[]>([])
    const [commentLoading, setCommentLoading] = useState(false)
    const [commentCount, setCommentCount] = useState(initialCommentCount)

    useEffect(() => {
        setCommentCount(initialCommentCount)
    }, [initialCommentCount, cardId])

    const loadComments = useCallback(async () => {
        if (cardId <= 0) return
        setCommentLoading(true)
        try {
            const res = await fetchComments(cardId)
            setComments(res.comments)
            setCommentCount(res.comments.length)
        } finally {
            setCommentLoading(false)
        }
    }, [cardId])

    const handleLike = useCallback(async () => {
        if (cardId <= 0 || likeLoading) return
        getOrCreateGuestId() // guest_id 쿠키 보장 (익명 사용자 식별)
        // 클릭 시점 상태를 캡처 — 비동기 완료 후에도 정확한 rollback 보장
        const wasLiked = liked
        setLiked(!wasLiked)
        setLikeCount((prev) => (wasLiked ? prev - 1 : prev + 1))
        setLikeLoading(true)
        try {
            const res = await toggleLike(cardId)
            setLiked(res.liked)
            setLikeCount(res.like_count)
        } catch {
            // 롤백
            setLiked(wasLiked)
            setLikeCount((prev) => (wasLiked ? prev + 1 : prev - 1))
        } finally {
            setLikeLoading(false)
        }
    }, [cardId, liked, likeLoading])

    const handleAddComment = useCallback(
        async (content: string, nickname: string) => {
            if (cardId <= 0) return
            await addComment(cardId, content, nickname)
            await loadComments()
        },
        [cardId, loadComments]
    )

    return {
        likeCount,
        liked,
        handleLike,
        likeLoading,
        comments,
        commentCount,
        commentLoading,
        loadComments,
        handleAddComment,
    }
}

"use client"

import { useEffect, useState } from "react"
import { ApiError } from "@/infrastructure/http/apiError"
import type { BoardListItem } from "../../domain/model/boardPost"
import { fetchBoardPost } from "../../infrastructure/api/boardApi"

export function useBoardDetail(boardId: number) {
    const [post, setPost] = useState<BoardListItem | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let cancelled = false
        setIsLoading(true)
        setError(null)

        fetchBoardPost(boardId)
            .then((data) => {
                if (!cancelled) setPost(data)
            })
            .catch((err) => {
                if (!cancelled) {
                    if (err instanceof ApiError) {
                        setError(err.message || "게시물을 불러오지 못했습니다.")
                    } else {
                        setError("게시물을 불러오지 못했습니다.")
                    }
                }
            })
            .finally(() => {
                if (!cancelled) setIsLoading(false)
            })

        return () => { cancelled = true }
    }, [boardId])

    return { post, isLoading, error }
}

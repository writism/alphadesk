"use client"

import { useEffect, useState } from "react"
import { ApiError } from "@/infrastructure/http/apiError"
import type { BoardListItem } from "../../domain/model/boardPost"
import { deleteBoardPost, fetchBoardPost } from "../../infrastructure/api/boardApi"

export function useBoardRead(boardId: number) {
    const [post, setPost] = useState<BoardListItem | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

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
                        if (err.status === 404) {
                            setError("존재하지 않는 게시물입니다.")
                        } else {
                            setError(err.message || "게시물을 불러오지 못했습니다.")
                        }
                    } else {
                        setError("게시물을 불러오지 못했습니다.")
                    }
                }
            })
            .finally(() => {
                if (!cancelled) setIsLoading(false)
            })

        return () => {
            cancelled = true
        }
    }, [boardId])

    const deletePost = async (): Promise<boolean> => {
        setIsDeleting(true)
        try {
            await deleteBoardPost(boardId)
            return true
        } catch (err) {
            if (err instanceof ApiError) {
                setError(err.message || "게시물 삭제에 실패했습니다.")
            } else {
                setError("게시물 삭제에 실패했습니다.")
            }
            return false
        } finally {
            setIsDeleting(false)
        }
    }

    return { post, isLoading, error, isDeleting, deletePost }
}

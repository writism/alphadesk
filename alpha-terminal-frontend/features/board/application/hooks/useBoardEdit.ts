"use client"

import { useEffect, useState } from "react"
import { ApiError } from "@/infrastructure/http/apiError"
import type { BoardListItem } from "../../domain/model/boardPost"
import { fetchBoardPost, updateBoardPost } from "../../infrastructure/api/boardApi"

export function useBoardEdit(boardId: number) {
    const [post, setPost] = useState<BoardListItem | null>(null)
    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [loadError, setLoadError] = useState<string | null>(null)
    const [submitError, setSubmitError] = useState<string | null>(null)

    useEffect(() => {
        let cancelled = false
        setIsLoading(true)
        setLoadError(null)

        fetchBoardPost(boardId)
            .then((data) => {
                if (cancelled) return
                setPost(data)
                setTitle(data.title)
                setContent(data.content)
            })
            .catch((err) => {
                if (cancelled) return
                if (err instanceof ApiError && err.status === 404) {
                    setLoadError("존재하지 않는 게시물입니다.")
                } else {
                    setLoadError("게시물을 불러오지 못했습니다.")
                }
            })
            .finally(() => {
                if (!cancelled) setIsLoading(false)
            })

        return () => {
            cancelled = true
        }
    }, [boardId])

    const submit = async (): Promise<BoardListItem | null> => {
        if (!title.trim() || !content.trim()) {
            setSubmitError("제목과 본문을 모두 입력해주세요.")
            return null
        }
        setIsSubmitting(true)
        setSubmitError(null)
        try {
            return await updateBoardPost(boardId, title.trim(), content.trim())
        } catch (err) {
            if (err instanceof ApiError) {
                setSubmitError(err.message || "게시물 수정에 실패했습니다.")
            } else {
                setSubmitError("게시물 수정에 실패했습니다.")
            }
            return null
        } finally {
            setIsSubmitting(false)
        }
    }

    return {
        post,
        title,
        content,
        setTitle,
        setContent,
        isLoading,
        isSubmitting,
        loadError,
        submitError,
        submit,
    }
}

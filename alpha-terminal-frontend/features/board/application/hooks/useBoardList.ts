"use client"

import { useState, useEffect, useCallback } from "react"
import { ApiError } from "@/infrastructure/http/apiError"
import { fetchBoardList } from "../../infrastructure/api/boardApi"
import type { BoardListItem } from "../../domain/model/boardPost"

export function useBoardList() {
    const [items, setItems] = useState<BoardListItem[]>([])
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const load = useCallback(async (p: number) => {
        setIsLoading(true)
        setError(null)
        try {
            const data = await fetchBoardList(p)
            setItems(data.items)
            setPage(data.page)
            setTotalPages(data.total_pages)
        } catch (err) {
            if (err instanceof ApiError && err.status === 401) {
                setError("로그인이 필요합니다.")
            } else {
                setError("게시물을 불러오지 못했습니다.")
            }
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        load(1)
    }, [load])

    const goToPage = (p: number) => load(p)

    return { items, page, totalPages, isLoading, error, goToPage }
}

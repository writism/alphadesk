"use client"

import { useCallback, useEffect, useState } from "react"
import type { YoutubeVideo } from "@/features/youtube/domain/model/youtubeVideo"
import { fetchYoutubeList } from "@/features/youtube/infrastructure/api/youtubeApi"

type Status = "LOADING" | "SUCCESS" | "ERROR"

interface UseYoutubeVideosReturn {
    videos: YoutubeVideo[]
    status: Status
    error: string | null
    totalResults: number
    currentPage: number
    hasNext: boolean
    hasPrev: boolean
    goNext: () => void
    goPrev: () => void
}

export function useYoutubeVideos(_pageSize: number = 9): UseYoutubeVideosReturn {
    const [videos, setVideos] = useState<YoutubeVideo[]>([])
    const [status, setStatus] = useState<Status>("LOADING")
    const [error, setError] = useState<string | null>(null)
    const [totalResults, setTotalResults] = useState(0)
    const [currentPage, setCurrentPage] = useState(1)
    const [nextToken, setNextToken] = useState<string | null>(null)
    const [prevToken, setPrevToken] = useState<string | null>(null)
    const load = useCallback(async (pageToken?: string, direction: "next" | "prev" | "init" = "init") => {
        setStatus("LOADING")
        setError(null)
        try {
            const data = await fetchYoutubeList(undefined, pageToken)
            setVideos(data.items)
            setTotalResults(data.total_results)
            setNextToken(data.next_page_token)
            setPrevToken(data.prev_page_token)
            if (direction === "next") setCurrentPage((p) => p + 1)
            else if (direction === "prev") setCurrentPage((p) => p - 1)
            else setCurrentPage(1)
            setStatus("SUCCESS")
        } catch (e) {
            setError(e instanceof Error ? e.message : "영상 목록을 불러오지 못했습니다.")
            setStatus("ERROR")
        }
    }, [])

    useEffect(() => {
        load()
    }, [load])

    const goNext = useCallback(() => {
        if (nextToken) load(nextToken, "next")
    }, [nextToken, load])

    const goPrev = useCallback(() => {
        if (prevToken) load(prevToken, "prev")
    }, [prevToken, load])

    return {
        videos,
        status,
        error,
        totalResults,
        currentPage,
        hasNext: !!nextToken,
        hasPrev: !!prevToken,
        goNext,
        goPrev,
    }
}

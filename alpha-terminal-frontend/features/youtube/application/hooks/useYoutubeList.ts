"use client"

import { useState } from "react"
import useSWR from "swr"
import { ApiError } from "@/infrastructure/http/apiError"
import { fetchYoutubeList } from "../../infrastructure/api/youtubeApi"

export function useYoutubeList(stockName?: string) {
    const [pageToken, setPageToken] = useState<string | undefined>(undefined)

    const { data, error, isLoading } = useSWR(
        ["/youtube", stockName ?? "", pageToken ?? ""],
        ([, name, token]) => fetchYoutubeList(name || undefined, token || undefined),
        { dedupingInterval: 30 * 60 * 1000 },
    )

    const errorMessage = error
        ? error instanceof ApiError
            ? error.status === 401
                ? "로그인이 필요합니다."
                : error.message || "영상 목록을 불러오지 못했습니다."
            : "영상 목록을 불러오지 못했습니다."
        : null

    return {
        items: data?.items ?? [],
        nextPageToken: data?.next_page_token ?? null,
        prevPageToken: data?.prev_page_token ?? null,
        totalResults: data?.total_results ?? 0,
        isLoading,
        error: errorMessage,
        goNext: () => { if (data?.next_page_token) setPageToken(data.next_page_token) },
        goPrev: () => { if (data?.prev_page_token) setPageToken(data.prev_page_token) },
    }
}

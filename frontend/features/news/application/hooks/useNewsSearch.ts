"use client"

import { useState, useCallback } from "react"
import { ApiError } from "@/infrastructure/http/apiError"
import { searchNews } from "@/features/news/infrastructure/api/newsApi"
import type { NewsArticleItem } from "@/features/news/domain/model/newsArticle"

const MARKET_MAP: Record<string, string> = {
    NASDAQ: "US",
    NYSE: "US",
    KOSPI: "KR",
    KOSDAQ: "KR",
}

function resolveMarket(market: string): string | null {
    return MARKET_MAP[market.toUpperCase()] ?? null
}

export function useNewsSearch() {
    const [articles, setArticles] = useState<NewsArticleItem[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetch = useCallback(async (keyword: string, market: string) => {
        setIsLoading(true)
        setError(null)
        try {
            const resolved = resolveMarket(market)
            const data = await searchNews(keyword, resolved)
            setArticles(data.items)
        } catch (err) {
            if (err instanceof ApiError) {
                setError(err.message || "뉴스를 불러오지 못했습니다.")
            } else {
                setError("뉴스를 불러오지 못했습니다.")
            }
            setArticles([])
        } finally {
            setIsLoading(false)
        }
    }, [])

    const clear = useCallback(() => {
        setArticles([])
        setError(null)
    }, [])

    return { articles, isLoading, error, fetch, clear }
}

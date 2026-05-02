"use client"

import { useCallback, useEffect, useState } from "react"
import { useAtomValue } from "jotai"
import { isLoggedInAtom } from "@/features/auth/application/selectors/authSelectors"
import { fetchSavedArticles, analyzeArticle } from "@/features/news/infrastructure/api/newsApi"
import type { SavedArticleItem, ArticleAnalysis } from "@/features/news/domain/model/newsArticle"

export function useSavedArticles() {
    const isLoggedIn = useAtomValue(isLoggedInAtom)
    const [items, setItems] = useState<SavedArticleItem[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [analyses, setAnalyses] = useState<Record<number, ArticleAnalysis | "loading" | "error">>({})

    const load = useCallback(async () => {
        if (!isLoggedIn) return
        setIsLoading(true)
        setError(null)
        try {
            const data = await fetchSavedArticles()
            setItems(data.items)
        } catch {
            setError("저장된 기사를 불러오지 못했습니다.")
        } finally {
            setIsLoading(false)
        }
    }, [isLoggedIn])

    useEffect(() => {
        load()
    }, [load])  // load depends on isLoggedIn so this is fine

    const analyze = useCallback(async (articleId: number) => {
        setAnalyses((prev) => ({ ...prev, [articleId]: "loading" }))
        try {
            const result = await analyzeArticle(articleId)
            setAnalyses((prev) => ({ ...prev, [articleId]: result }))
        } catch {
            setAnalyses((prev) => ({ ...prev, [articleId]: "error" }))
        }
    }, [])

    return { items, isLoading, error, analyses, analyze, reload: load }
}

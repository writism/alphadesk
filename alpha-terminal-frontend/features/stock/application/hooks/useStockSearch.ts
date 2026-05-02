"use client"

import { useState, useCallback, useRef } from "react"
import { ApiError } from "@/infrastructure/http/apiError"
import { searchStocks } from "../../infrastructure/api/stockApi"
import type { StockItem } from "../../domain/model/stockItem"

const DEBOUNCE_MS = 300

export const useStockSearch = () => {
    const [results, setResults] = useState<StockItem[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [query, setQuery] = useState("")
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const search = useCallback((q: string) => {
        setQuery(q)
        if (debounceRef.current) clearTimeout(debounceRef.current)
        if (q.length < 1) {
            setResults([])
            setError(null)
            setIsLoading(false)
            return
        }
        setIsLoading(true)
        debounceRef.current = setTimeout(async () => {
            setError(null)
            try {
                const data = await searchStocks(q)
                setResults(data)
            } catch (err) {
                if (err instanceof ApiError) {
                    setError(err.message || "검색에 실패했습니다.")
                } else {
                    setError("검색에 실패했습니다.")
                }
                setResults([])
            } finally {
                setIsLoading(false)
            }
        }, DEBOUNCE_MS)
    }, [])

    const clear = useCallback(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current)
        setQuery("")
        setResults([])
        setError(null)
        setIsLoading(false)
    }, [])

    return { results, isLoading, error, query, search, clear }
}

"use client"

import { useEffect, useMemo, useState } from "react"
import { ApiError } from "@/infrastructure/http/apiError"
import type { DailyReturnsHeatmapResponse } from "../../domain/model/dailyReturnsHeatmap"
import { fetchDailyReturnsHeatmap } from "../../infrastructure/api/stockHeatmapApi"

const CACHE_TTL_MS = 10 * 60 * 1000
const responseCache = new Map<string, { expiresAt: number; data: DailyReturnsHeatmapResponse }>()

function normalizeSymbols(symbols: string[]): string[] {
    return [...new Set(symbols.map((s) => s.trim()).filter(Boolean))].sort()
}

function stableKey(symbols: string[], weeks: number): string {
    return `${weeks}::${symbols.join("\0")}`
}

export function useDailyReturnsHeatmap(symbols: string[], weeks: number = 6) {
    const normalizedSymbols = useMemo(() => normalizeSymbols(symbols), [symbols])
    const key = useMemo(() => stableKey(normalizedSymbols, weeks), [normalizedSymbols, weeks])
    const [data, setData] = useState<DailyReturnsHeatmapResponse | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (normalizedSymbols.length === 0) {
            setData(null)
            setError(null)
            setIsLoading(false)
            return
        }

        const cached = responseCache.get(key)
        const now = Date.now()
        if (cached && cached.expiresAt > now) {
            setData(cached.data)
            setError(null)
            setIsLoading(false)
            return
        }

        let cancelled = false
        if (cached?.data) {
            setData(cached.data)
        }
        setError(null)
        setIsLoading(true)

        fetchDailyReturnsHeatmap(normalizedSymbols, weeks)
            .then((res) => {
                if (!cancelled) {
                    responseCache.set(key, { expiresAt: Date.now() + CACHE_TTL_MS, data: res })
                    setData(res)
                }
            })
            .catch((err) => {
                if (!cancelled) {
                    if (err instanceof ApiError) {
                        setError(err.message || "히트맵 데이터를 불러오지 못했습니다.")
                    } else {
                        setError("히트맵 데이터를 불러오지 못했습니다.")
                    }
                    setData(null)
                }
            })
            .finally(() => {
                if (!cancelled) setIsLoading(false)
            })

        return () => {
            cancelled = true
        }
    }, [key, normalizedSymbols, weeks])

    const bySymbol = useMemo(() => {
        if (!data?.items.length) return {} as Record<string, DailyReturnsHeatmapResponse["items"][0]>
        const m: Record<string, DailyReturnsHeatmapResponse["items"][0]> = {}
        for (const it of data.items) {
            m[it.symbol.trim().toUpperCase()] = it
        }
        return m
    }, [data])

    return { data, bySymbol, isLoading, error }
}

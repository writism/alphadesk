"use client"

import { useCallback, useEffect } from "react"
import { useAtom } from "jotai"
import { mutate as globalMutate } from "swr"
import { ApiError } from "@/infrastructure/http/apiError"
import { fetchWatchlist, addWatchlistItem, deleteWatchlistItem } from "../../infrastructure/api/watchlistApi"
import { watchlistAtom } from "../atoms/watchlistAtom"

const DASHBOARD_SWR_KEY = "/dashboard/data"

export const useWatchlist = () => {
    const [state, setState] = useAtom(watchlistAtom)

    const load = useCallback(async () => {
        setState(s => ({ ...s, isLoading: true, error: null }))
        try {
            const data = await fetchWatchlist()
            setState({ items: data, isLoading: false, error: null, initialized: true })
        } catch (err) {
            const msg = err instanceof ApiError
                ? (err.status === 401 ? "로그인이 필요합니다." : err.message || "목록을 불러오지 못했습니다.")
                : "목록을 불러오지 못했습니다."
            setState(s => ({ ...s, isLoading: false, error: msg, initialized: true }))
        }
    }, [setState])

    useEffect(() => {
        if (!state.initialized && !state.isLoading) {
            load()
        }
    }, [state.initialized, state.isLoading, load])

    const add = useCallback(async (symbol: string, name: string, market?: string) => {
        setState(s => ({ ...s, error: null }))
        try {
            const item = await addWatchlistItem(symbol, name, market)
            setState(s => ({ ...s, items: [...s.items, item] }))
            return true
        } catch (err) {
            const msg = err instanceof ApiError
                ? (err.status === 409 ? "이미 등록된 종목입니다."
                    : err.status === 401 ? "로그인이 만료되었습니다."
                    : err.message || "등록에 실패했습니다.")
                : "등록에 실패했습니다."
            setState(s => ({ ...s, error: msg }))
            return false
        }
    }, [setState])

    const remove = useCallback(async (id: number) => {
        setState(s => ({ ...s, error: null }))
        try {
            await deleteWatchlistItem(id)
            setState(s => ({ ...s, items: s.items.filter(item => item.id !== id) }))
            await globalMutate(DASHBOARD_SWR_KEY)
        } catch (err) {
            const msg = err instanceof ApiError
                ? err.message || "삭제에 실패했습니다."
                : "삭제에 실패했습니다."
            setState(s => ({ ...s, error: msg }))
        }
    }, [setState])

    return { items: state.items, isLoading: state.isLoading, error: state.error, add, remove }
}

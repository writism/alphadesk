"use client"

import useSWR from "swr"
import { fetchSharedCards } from "../../infrastructure/api/shareApi"
import type { SharedCardListResponse } from "../../domain/model/sharedCard"

const fetcher = (_key: string, limit: number, offset: number) =>
    fetchSharedCards(limit, offset)

export function useSharedCards(limit = 10) {
    const { data, error, isLoading, mutate } = useSWR<SharedCardListResponse>(
        ["/card-share", limit, 0],
        ([, l, o]) => fetchSharedCards(l as number, o as number),
        {
            revalidateOnFocus: true,       // 탭 활성화 시 즉시 갱신
            revalidateOnReconnect: true,   // 네트워크 재연결 시 갱신
            refreshInterval: 10_000,       // 10초마다 폴링
            refreshWhenHidden: false,      // 탭이 백그라운드면 폴링 중단 (기본값)
            refreshWhenOffline: false,     // 오프라인이면 폴링 중단 (기본값)
            dedupingInterval: 2_000,
        }
    )

    // 즉시 재요청 — SWR 캐시에 fresh Promise 직접 주입 후 revalidate
    const reload = () => mutate(fetchSharedCards(limit, 0), { revalidate: false })

    return {
        cards: data?.cards ?? [],
        total: data?.total ?? 0,
        loading: isLoading,
        error: error?.message ?? null,
        reload,
    }
}

"use client"

import { useCallback } from "react"
import { useAtom } from "jotai"
import { authStateAtom } from "@/features/auth/application/atoms/authAtom"
import { saveRecentlyViewed, type SaveRecentlyViewedPayload } from "../../infrastructure/api/profileApi"

export const useRecordRecentlyViewed = () => {
    const [authState] = useAtom(authStateAtom)

    return useCallback(
        async (payload: SaveRecentlyViewedPayload) => {
            if (authState.status !== "AUTHENTICATED") return
            try {
                await saveRecentlyViewed(authState.user.accountId, payload)
            } catch {
                // silent fail: 이력 등록 실패는 사용자 경험에 영향 없음
            }
        },
        [authState],
    )
}

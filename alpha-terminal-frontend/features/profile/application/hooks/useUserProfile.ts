"use client"

import { useState, useEffect, useCallback } from "react"
import { useAtom } from "jotai"
import { authStateAtom } from "@/features/auth/application/atoms/authAtom"
import { ApiError } from "@/infrastructure/http/apiError"
import {
    getUserProfile,
    saveRecentlyViewed,
    saveClickedCard,
    type SaveRecentlyViewedPayload,
    type SaveClickedCardPayload,
} from "../../infrastructure/api/profileApi"
import type { UserProfile } from "../../domain/model/userProfile"
import type { InteractionHistory } from "../../domain/model/interactionHistory"

export const useUserProfile = () => {
    const [authState] = useAtom(authStateAtom)
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const userId =
        authState.status === "AUTHENTICATED" ? authState.user.accountId : null

    const load = useCallback(async () => {
        if (!userId) return
        setIsLoading(true)
        setError(null)
        try {
            const prof = await getUserProfile(userId)
            setProfile(prof)
        } catch (err) {
            if (err instanceof ApiError) {
                setError(err.message || "프로필을 불러오지 못했습니다.")
            } else {
                setError("프로필을 불러오지 못했습니다.")
            }
        } finally {
            setIsLoading(false)
        }
    }, [userId])

    const recordRecentlyViewed = useCallback(
        async (payload: SaveRecentlyViewedPayload) => {
            if (!userId) return
            try {
                await saveRecentlyViewed(userId, payload)
            } catch {
                // 이력 저장 실패는 사용자에게 노출하지 않음
            }
        },
        [userId],
    )

    const recordClickedCard = useCallback(
        async (payload: SaveClickedCardPayload) => {
            if (!userId) return
            try {
                await saveClickedCard(userId, payload)
            } catch {
                // 이력 저장 실패는 사용자에게 노출하지 않음
            }
        },
        [userId],
    )

    const history: InteractionHistory[] = (profile?.recently_viewed ?? [])
        .map((item) => ({
            symbol: item.symbol,
            name: item.name,
            market: item.market,
            viewedAt: item.viewed_at,
        }))
        .sort((a, b) => new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime())

    useEffect(() => {
        load()
    }, [load])

    return { profile, history, isLoading, error, recordRecentlyViewed, recordClickedCard }
}

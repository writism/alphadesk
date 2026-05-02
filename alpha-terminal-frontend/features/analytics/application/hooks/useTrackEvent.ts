"use client"

import { useEffect, useRef } from "react"
import { useAtomValue } from "jotai"
import { isLoggedInAtom } from "@/features/auth/application/selectors/authSelectors"
import { recordEvent, type EventType } from "@/features/analytics/infrastructure/api/activityApi"

/**
 * 페이지 마운트 시 이벤트를 1회 전송한다.
 * 로그인 상태일 때만 전송.
 */
export function useTrackEvent(eventType: EventType, campaign?: string) {
    const isLoggedIn = useAtomValue(isLoggedInAtom)
    const fired = useRef(false)

    useEffect(() => {
        if (!isLoggedIn || fired.current) return
        fired.current = true
        recordEvent(eventType, campaign)
    }, [isLoggedIn, eventType, campaign])
}

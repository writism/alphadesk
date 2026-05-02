"use client"

import { useEffect, useState } from "react"
import { useAtomValue } from "jotai"
import { authStateAtom } from "@/features/auth/application/atoms/authAtom"
import { fetchAnalysisLogs } from "@/features/dashboard/infrastructure/api/dashboardApi"
import { fetchPublicHomeLogs } from "@/features/public/infrastructure/api/publicApi"
import { calcHomeStats } from "../../domain/selectors/homeSelectors"
import { calcTodayBriefing } from "../../domain/selectors/todayBriefingSelectors"
import type { HomeStats } from "../../domain/model/homeStats"
import type { TodayBriefing } from "../../domain/model/todayBriefing"

type HomeState =
    | { status: "LOADING" }
    | { status: "UNAUTHENTICATED" }
    | { status: "EMPTY" }
    | { status: "READY"; stats: HomeStats; briefing: TodayBriefing }
    | { status: "PUBLIC_READY"; stats: HomeStats; briefing: TodayBriefing }
    | { status: "ERROR"; message: string }

export function useHome(): HomeState {
    const authState = useAtomValue(authStateAtom)
    const [state, setState] = useState<HomeState>({ status: "LOADING" })

    useEffect(() => {
        // auth 확정 전까지 대기
        if (authState.status === "LOADING") return

        if (authState.status === "AUTHENTICATED") {
            fetchAnalysisLogs()
                .then((logs) => {
                    if (logs.length === 0) {
                        setState({ status: "EMPTY" })
                    } else {
                        setState({
                            status: "READY",
                            stats: calcHomeStats(logs),
                            briefing: calcTodayBriefing(logs),
                        })
                    }
                })
                .catch(() => {
                    setState({ status: "ERROR", message: "데이터를 불러오지 못했습니다." })
                })
        } else {
            // UNAUTHENTICATED / PENDING_TERMS: 공개 관심종목 데이터 (데이터 없어도 UI 표시)
            fetchPublicHomeLogs()
                .then((publicLogs) => {
                    setState({
                        status: "PUBLIC_READY",
                        stats: calcHomeStats(publicLogs),
                        briefing: calcTodayBriefing(publicLogs),
                    })
                })
                .catch(() => {
                    setState({ status: "UNAUTHENTICATED" })
                })
        }
    }, [authState.status])

    return state
}

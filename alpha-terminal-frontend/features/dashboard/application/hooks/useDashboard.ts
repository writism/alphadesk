"use client"

import { useCallback } from "react"
import { useAtom } from "jotai"
import useSWR, { mutate as globalMutate } from "swr"
import { ApiError } from "@/infrastructure/http/apiError"
import type { PipelineProgressEvent } from "../../domain/model/pipelineProgressEvent"
import {
    fetchAnalysisLogs,
    fetchDashboardSummaries,
    fetchReportSummaries,
    runPipeline,
    runPipelineStream,
} from "../../infrastructure/api/dashboardApi"
import type { AnalysisLog, StockSummary, PipelineResult } from "../../domain/model/stockSummary"
import {
    pipelineRunningAtom,
    pipelineProgressEventsAtom,
    pipelineResultAtom,
    pipelineElapsedSecondsAtom,
    pipelineErrorAtom,
    articleModeAtom,
} from "../atoms/pipelineAtom"

const DASHBOARD_KEY = "/dashboard/data"

// BL-FE-76: Promise.allSettled로 부분 실패 대응
// - 401 → 즉시 throw (재로그인 유도)
// - 전체 실패 → throw (에러 배너 + RETRY)
// - 일부 실패 → 성공한 데이터만 반환, 실패 섹션은 []
async function fetchDashboardData() {
    const [summaryResult, reportResult, logResult] = await Promise.allSettled([
        fetchDashboardSummaries(),
        fetchReportSummaries(),
        fetchAnalysisLogs(),
    ])

    for (const result of [summaryResult, reportResult, logResult]) {
        if (result.status === 'rejected' && result.reason instanceof ApiError && result.reason.status === 401) {
            throw result.reason
        }
    }

    if (summaryResult.status === 'rejected' && reportResult.status === 'rejected' && logResult.status === 'rejected') {
        throw summaryResult.reason
    }

    return {
        summaries: summaryResult.status === 'fulfilled' ? summaryResult.value : [],
        reportSummaries: reportResult.status === 'fulfilled' ? reportResult.value : [],
        analysisLogs: logResult.status === 'fulfilled' ? logResult.value : [],
    }
}

function formatLoadError(err: unknown): string {
    if (err instanceof ApiError) {
        if (err.status === 401) return "로그인이 필요합니다. 다시 로그인해 주세요."
        return err.message || "데이터를 불러오지 못했습니다."
    }
    return "데이터를 불러오지 못했습니다."
}

function formatPipelineError(err: unknown): string {
    if (err instanceof ApiError) {
        if (err.status === 401) return "로그인이 만료되었습니다. 다시 로그인해 주세요."
        return err.message || "파이프라인 실행에 실패했습니다."
    }
    return "파이프라인 실행에 실패했습니다."
}

export const useDashboard = () => {
    const { data, error: swrError, isLoading, mutate } = useSWR(
        DASHBOARD_KEY,
        fetchDashboardData,
        { dedupingInterval: 10 * 60 * 1000 },
    )

    const [running, setRunning] = useAtom(pipelineRunningAtom)
    const [pipelineError, setPipelineError] = useAtom(pipelineErrorAtom)
    const [pipelineResult, setPipelineResult] = useAtom(pipelineResultAtom)
    const [progressEvents, setProgressEvents] = useAtom(pipelineProgressEventsAtom)
    const [elapsedSeconds, setElapsedSeconds] = useAtom(pipelineElapsedSecondsAtom)
    const [articleMode, setArticleMode] = useAtom(articleModeAtom)

    const executePipeline = useCallback(async (symbols?: string[]) => {
        setPipelineError(null)
        setPipelineResult(null)
        setProgressEvents([])
        setElapsedSeconds(null)
        setRunning(true)

        const startedAt = Date.now()

        const onEvent = (event: PipelineProgressEvent) => {
            setProgressEvents((prev) => [...prev, event])
        }

        try {
            const streamResult = await runPipelineStream(symbols, onEvent, articleMode)

            if (!streamResult.used) {
                const result = await runPipeline(symbols, articleMode)
                setPipelineResult(result)
            } else if (streamResult.streamError) {
                setPipelineError(streamResult.streamError)
            }

            setElapsedSeconds(Math.round((Date.now() - startedAt) / 1000))
            await globalMutate(DASHBOARD_KEY)
            setProgressEvents([])
        } catch (err) {
            setElapsedSeconds(Math.round((Date.now() - startedAt) / 1000))
            setPipelineError(formatPipelineError(err))
            setProgressEvents([])
        } finally {
            setRunning(false)
        }
    }, [setPipelineError, setPipelineResult, setProgressEvents, setElapsedSeconds, setRunning, articleMode])

    const error = swrError ? formatLoadError(swrError) : pipelineError

    return {
        summaries: data?.summaries ?? [],
        reportSummaries: data?.reportSummaries ?? [],
        analysisLogs: data?.analysisLogs ?? [],
        isLoading,
        error,
        running,
        pipelineResult,
        progressEvents,
        elapsedSeconds,
        articleMode,
        setArticleMode,
        executePipeline,
        reload: mutate,
    }
}

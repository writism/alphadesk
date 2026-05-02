"use client"

import { useAtom } from "jotai"
import { useCallback } from "react"
import { streamInvestmentDecision } from "@/features/invest/infrastructure/api/investApi"
import {
    investQueryAtom,
    investResultAtom,
    investIsLoadingAtom,
    investErrorAtom,
    investLogsAtom,
} from "@/features/invest/application/atoms/investJudgmentAtom"

export function useInvestJudgment() {
    const [query, setQuery] = useAtom(investQueryAtom)
    const [result, setResult] = useAtom(investResultAtom)
    const [isLoading, setIsLoading] = useAtom(investIsLoadingAtom)
    const [error, setError] = useAtom(investErrorAtom)
    const [logs, setLogs] = useAtom(investLogsAtom)

    const submit = useCallback(async () => {
        if (!query.trim()) return
        setIsLoading(true)
        setError(null)
        setResult(null)
        setLogs([])
        try {
            for await (const event of streamInvestmentDecision(query.trim())) {
                if (event.type === "log") {
                    setLogs((prev) => [...prev, event.data])
                } else if (event.type === "result") {
                    setResult({ answer: event.data })
                } else if (event.type === "error") {
                    setError(event.data)
                }
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "투자 판단 요청에 실패했습니다.")
        } finally {
            setIsLoading(false)
        }
    }, [query, setIsLoading, setError, setResult, setLogs])

    const reset = useCallback(() => {
        setQuery("")
        setResult(null)
        setError(null)
        setLogs([])
    }, [setQuery, setResult, setError, setLogs])

    return { query, setQuery, result, isLoading, error, logs, submit, reset }
}

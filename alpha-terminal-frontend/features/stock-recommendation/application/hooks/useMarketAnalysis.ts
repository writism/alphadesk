"use client"

import { useState, useCallback } from "react"
import { askMarketAnalysis } from "../../infrastructure/api/marketAnalysisApi"
import type { AnalysisAnswer } from "../../domain/model/analysisAnswer"

export function useMarketAnalysis() {
    const [question, setQuestion] = useState("")
    const [answer, setAnswer] = useState<AnalysisAnswer | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const submit = useCallback(async () => {
        if (!question.trim()) return
        setIsLoading(true)
        setError(null)
        setAnswer(null)
        try {
            const result = await askMarketAnalysis(question.trim())
            setAnswer(result)
        } catch (err) {
            setError(err instanceof Error ? err.message : "질문 처리에 실패했습니다.")
        } finally {
            setIsLoading(false)
        }
    }, [question])

    const reset = useCallback(() => {
        setQuestion("")
        setAnswer(null)
        setError(null)
    }, [])

    return { question, setQuestion, answer, isLoading, error, submit, reset }
}

"use client"

import { useAtom, useSetAtom } from "jotai"
import { useCallback } from "react"
import {
    isSubmittingAtom,
    questionAtom,
    recommendationErrorAtom,
    recommendationResultAtom,
} from "@/features/stock-recommendation/application/atoms/stockRecommendationAtom"
import { createStockRecommendationCommand } from "@/features/stock-recommendation/application/commands/stockRecommendationCommand"
import { StockRecommendationIntent } from "@/features/stock-recommendation/domain/intent/stockRecommendationIntent"
import { submitStockQuestion } from "@/features/stock-recommendation/infrastructure/api/stockRecommendationApi"

export function useStockRecommendation() {
    const [question, setQuestion] = useAtom(questionAtom)
    const [isSubmitting, setIsSubmitting] = useAtom(isSubmittingAtom)
    const [result, setResult] = useAtom(recommendationResultAtom)
    const [error, setError] = useAtom(recommendationErrorAtom)

    const submit = useCallback(
        async (q: string) => {
            setIsSubmitting(true)
            setError(null)
            try {
                const response = await submitStockQuestion({ question: q })
                setResult(response)
                setQuestion("")
            } catch (e: unknown) {
                const msg = e instanceof Error ? e.message : "요청 중 오류가 발생했습니다."
                setError(msg)
            } finally {
                setIsSubmitting(false)
            }
        },
        [setIsSubmitting, setError, setResult, setQuestion],
    )

    const clear = useCallback(() => {
        setResult(null)
        setError(null)
        setQuestion("")
    }, [setResult, setError, setQuestion])

    const command = createStockRecommendationCommand(submit, clear)

    const dispatch = useCallback(
        (intent: StockRecommendationIntent) => {
            command[intent.type](intent)
        },
        [command],
    )

    return {
        question,
        setQuestion,
        isSubmitting,
        result,
        error,
        dispatch,
        canSubmit: question.trim().length > 0 && !isSubmitting,
    }
}

import { StockRecommendationIntent } from "@/features/stock-recommendation/domain/intent/stockRecommendationIntent"
import { StockRecommendationResponse } from "@/features/stock-recommendation/domain/model/stockRecommendation"

type SubmitFn = (question: string) => Promise<void>
type ClearFn = () => void

export function createStockRecommendationCommand(
    submit: SubmitFn,
    clear: ClearFn,
): Record<StockRecommendationIntent["type"], (intent: StockRecommendationIntent) => void> {
    return {
        SUBMIT_QUESTION: (intent) => {
            if (intent.type !== "SUBMIT_QUESTION") return
            submit(intent.question)
        },
        CLEAR_RESULT: () => {
            clear()
        },
    }
}

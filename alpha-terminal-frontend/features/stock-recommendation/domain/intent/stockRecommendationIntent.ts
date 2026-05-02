export type StockRecommendationIntent =
    | { type: "SUBMIT_QUESTION"; question: string }
    | { type: "CLEAR_RESULT" }

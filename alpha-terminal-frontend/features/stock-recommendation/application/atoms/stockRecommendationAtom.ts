import { atom } from "jotai"
import { StockRecommendationResponse } from "@/features/stock-recommendation/domain/model/stockRecommendation"

export const questionAtom = atom<string>("")
export const isSubmittingAtom = atom<boolean>(false)
export const recommendationResultAtom = atom<StockRecommendationResponse | null>(null)
export const recommendationErrorAtom = atom<string | null>(null)

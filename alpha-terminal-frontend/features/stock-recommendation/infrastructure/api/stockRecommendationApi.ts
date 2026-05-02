import { httpClient } from "@/infrastructure/http/httpClient"
import {
    StockRecommendationRequest,
    StockRecommendationResponse,
} from "@/features/stock-recommendation/domain/model/stockRecommendation"

export async function submitStockQuestion(
    request: StockRecommendationRequest,
): Promise<StockRecommendationResponse> {
    const res = await httpClient.post("/stock-recommendation/ask", request)
    return res.json()
}

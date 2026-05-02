import { httpClient } from "@/infrastructure/http/httpClient"
import type { YoutubeListResponse } from "../../domain/model/youtubeVideo"

export const PAGE_SIZE = 9

export async function fetchYoutubeList(stockName?: string, pageToken?: string): Promise<YoutubeListResponse> {
    const params = new URLSearchParams({ size: String(PAGE_SIZE) })
    if (stockName) params.set("stock_name", stockName)
    if (pageToken) params.set("page_token", pageToken)
    const res = await httpClient.get(`/youtube/list?${params}`)
    return res.json()
}

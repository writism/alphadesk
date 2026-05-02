import { httpClient } from "@/infrastructure/http/httpClient"
import type { DailyReturnsHeatmapResponse } from "../../domain/model/dailyReturnsHeatmap"

export async function fetchDailyReturnsHeatmap(
    symbols: string[],
    weeks: number = 6,
): Promise<DailyReturnsHeatmapResponse> {
    const uniq = [...new Set(symbols.map((s) => s.trim()).filter(Boolean))]
    const params = new URLSearchParams()
    params.set("symbols", uniq.join(","))
    params.set("weeks", String(weeks))
    const res = await httpClient.get(`/stocks/daily-returns-heatmap?${params.toString()}`)
    return res.json() as Promise<DailyReturnsHeatmapResponse>
}

import { httpClient } from "@/infrastructure/http/httpClient"
import type { StockItem } from "../../domain/model/stockItem"
import type { StockDetail } from "../../domain/model/stockDetail"

export async function searchStocks(q: string): Promise<StockItem[]> {
    const res = await httpClient.get(`/stocks/search?q=${encodeURIComponent(q)}`)
    return res.json()
}

export async function fetchStockDetail(symbol: string): Promise<StockDetail> {
    const res = await httpClient.get(`/stocks/${encodeURIComponent(symbol)}`)
    if (!res.ok) throw new Error("종목을 찾을 수 없습니다.")
    return res.json()
}

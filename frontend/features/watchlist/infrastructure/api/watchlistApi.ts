import { httpClient } from "@/infrastructure/http/httpClient"
import type { WatchlistItem } from "../../domain/model/watchlistItem"

export async function fetchWatchlist(): Promise<WatchlistItem[]> {
    const res = await httpClient.get("/watchlist")
    return res.json()
}

export async function addWatchlistItem(symbol: string, name: string, market?: string): Promise<WatchlistItem> {
    const res = await httpClient.post("/watchlist", { symbol, name, market: market || null })
    return res.json()
}

export async function deleteWatchlistItem(id: number): Promise<void> {
    await httpClient.delete(`/watchlist/${id}`)
}

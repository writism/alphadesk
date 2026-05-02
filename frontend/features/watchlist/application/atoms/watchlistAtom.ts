import { atom } from "jotai"
import type { WatchlistItem } from "@/features/watchlist/domain/model/watchlistItem"

interface WatchlistState {
    items: WatchlistItem[]
    isLoading: boolean
    error: string | null
    initialized: boolean
}

export const watchlistAtom = atom<WatchlistState>({
    items: [],
    isLoading: false,
    error: null,
    initialized: false,
})

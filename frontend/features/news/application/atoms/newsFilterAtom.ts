import { atom } from "jotai"

export type MarketFilter = "ALL" | "KR" | "US"

export const newsMarketFilterAtom = atom<MarketFilter>("ALL")

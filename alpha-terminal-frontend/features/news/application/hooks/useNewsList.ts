"use client"

import { useCallback, useEffect, useRef } from "react"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import { useRouter } from "next/navigation"
import { ApiError } from "@/infrastructure/http/apiError"
import { isLoggedInAtom } from "@/features/auth/application/selectors/authSelectors"
import { fetchWatchlist } from "@/features/watchlist/infrastructure/api/watchlistApi"
import { searchNews, saveInterestArticle } from "@/features/news/infrastructure/api/newsApi"
import { newsListAtom } from "@/features/news/application/atoms/newsListAtom"
import { interestArticleAtom } from "@/features/news/application/atoms/interestArticleAtom"
import { newsMarketFilterAtom, type MarketFilter } from "@/features/news/application/atoms/newsFilterAtom"
import { createNewsCommand } from "@/features/news/application/commands/newsCommand"
import type { NewsIntent } from "@/features/news/domain/intent/newsIntent"
import type { NewsArticleItem, NewsSearchResponse, SaveInterestArticleRequest } from "@/features/news/domain/model/newsArticle"

export type { MarketFilter } from "@/features/news/application/atoms/newsFilterAtom"

const PAGE_SIZE = 10
const MAX_KEYWORD_ITEMS = 5

const KR_MARKETS = ["KOSDAQ", "KOSPI", "KR"]

interface MarketKeywords {
    kr: string | null
    us: string | null
}

async function buildMarketKeywords(): Promise<MarketKeywords> {
    try {
        const items = await fetchWatchlist()
        const krItems = items.filter((i) => KR_MARKETS.includes((i.market ?? "").toUpperCase()))
        const usItems = items.filter((i) => !KR_MARKETS.includes((i.market ?? "").toUpperCase()))

        const toKeyword = (list: typeof items, max: number) =>
            list.length === 0
                ? null
                : list
                      .slice(0, max)
                      .map((i) => `"${i.name || i.symbol}"`)
                      .join(" OR ")

        return {
            kr: toKeyword(krItems, MAX_KEYWORD_ITEMS),
            us: toKeyword(usItems, MAX_KEYWORD_ITEMS),
        }
    } catch {
        return { kr: null, us: "stock" }
    }
}

export type SaveResult = "ok" | "duplicate" | "unauthenticated" | "error"

export function useNewsList() {
    const isLoggedIn = useAtomValue(isLoggedInAtom)
    const [state, setState] = useAtom(newsListAtom)
    const setInterestArticle = useSetAtom(interestArticleAtom)
    const [marketFilter, setMarketFilter] = useAtom(newsMarketFilterAtom)
    const router = useRouter()

    const fetchIdRef = useRef(0)

    const fetchPage = useCallback(async (page: number, market: MarketFilter) => {
        const fetchId = ++fetchIdRef.current
        setState((s) => ({ ...s, isLoading: true, error: null, page, items: [], totalCount: 0 }))

        try {
            const { kr, us } = await buildMarketKeywords()

            const calls: Promise<NewsSearchResponse>[] = []
            if (market !== "US" && kr) calls.push(searchNews(kr, "KR", page, PAGE_SIZE))
            if (market !== "KR" && us) calls.push(searchNews(us, "US", page, PAGE_SIZE))
            if (calls.length === 0) calls.push(searchNews("stock", null, page, PAGE_SIZE))

            const seenLinks = new Set<string>()
            let remaining = calls.length

            for (const call of calls) {
                call
                    .then((result) => {
                        if (fetchId !== fetchIdRef.current) return
                        remaining -= 1
                        const newItems = result.items.filter((item) => {
                            if (seenLinks.has(item.link ?? "")) return false
                            seenLinks.add(item.link ?? "")
                            return true
                        })
                        setState((s) => ({
                            ...s,
                            items: [...s.items, ...newItems],
                            totalCount: s.totalCount + result.total_count,
                            isLoading: remaining > 0,
                        }))
                    })
                    .catch(() => {
                        if (fetchId !== fetchIdRef.current) return
                        remaining -= 1
                        setState((s) => ({ ...s, isLoading: remaining > 0 }))
                    })
            }
        } catch (err) {
            if (fetchId !== fetchIdRef.current) return
            const message =
                err instanceof ApiError
                    ? err.message || "뉴스를 불러오지 못했습니다."
                    : "뉴스를 불러오지 못했습니다."
            setState((s) => ({ ...s, isLoading: false, error: message, items: [] }))
        }
    }, [setState])

    const save = useCallback(async (article: NewsArticleItem): Promise<SaveResult> => {
        if (!isLoggedIn) return "unauthenticated"

        const req: SaveInterestArticleRequest = {
            title: article.title,
            published_at: article.published_at,
            source: article.source,
            link: article.link ?? "",
        }
        try {
            const response = await saveInterestArticle(req)
            setInterestArticle(response)
            router.push("/news/saved")
            return "ok"
        } catch (err) {
            if (err instanceof ApiError && err.status === 401) return "unauthenticated"
            if (err instanceof ApiError && err.status === 409) return "duplicate"
            return "error"
        }
    }, [isLoggedIn, setInterestArticle, router])

    const dispatch = useCallback(
        (intent: NewsIntent) => {
            const commands = createNewsCommand(
                (page) => fetchPage(page, marketFilter),
                (article) => { save(article) },
            )
            commands[intent.type](intent)
        },
        [fetchPage, marketFilter, save],
    )

    const changePage = useCallback(
        (page: number) => dispatch({ type: "CHANGE_PAGE", page }),
        [dispatch],
    )

    const changeMarket = useCallback(
        (market: MarketFilter) => {
            setMarketFilter(market)
        },
        [setMarketFilter],
    )

    // BL-FE-77: fetchPage·setState를 deps에 명시 (eslint-disable 제거)
    // Jotai setter는 참조 안정적이므로 무한 루프 없음
    useEffect(() => {
        if (isLoggedIn) {
            fetchPage(1, marketFilter)
        } else {
            setState((s) => ({ ...s, error: "로그인이 필요합니다.", items: [], isLoading: false }))
        }
    }, [isLoggedIn, marketFilter, fetchPage, setState])

    const totalPages = Math.max(1, Math.ceil(state.totalCount / state.pageSize))
    const rangeStart = state.totalCount === 0 ? 0 : (state.page - 1) * state.pageSize + 1
    const rangeEnd = Math.min(state.page * state.pageSize, state.totalCount)

    return {
        ...state,
        totalPages,
        rangeStart,
        rangeEnd,
        marketFilter,
        changeMarket,
        changePage,
        save,
    }
}

import { atom } from "jotai"
import type { NewsArticleItem } from "@/features/news/domain/model/newsArticle"

export interface NewsListState {
    items: NewsArticleItem[]
    totalCount: number
    page: number
    pageSize: number
    isLoading: boolean
    error: string | null
}

export const newsListAtom = atom<NewsListState>({
    items: [],
    totalCount: 0,
    page: 1,
    pageSize: 10,
    isLoading: false,
    error: null,
})

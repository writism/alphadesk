import { atom } from "jotai"
import type { NewsArticleItem } from "@/features/news/domain/model/newsArticle"

export interface SavedArticleContent {
    id: number
    title: string
    source: string
    link: string
    published_at: string | null
    content: string | null
}

/** 가장 최근에 저장한 기사의 원문 데이터. 전역 상태로 UI 어디서든 조회 가능. */
export const savedArticleContentAtom = atom<SavedArticleContent | null>(null)

export function toSavedArticleContent(id: number, article: NewsArticleItem): SavedArticleContent {
    return {
        id,
        title: article.title,
        source: article.source,
        link: article.link ?? "",
        published_at: article.published_at,
        content: null,
    }
}

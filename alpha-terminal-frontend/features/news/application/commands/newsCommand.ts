import type { NewsArticleItem } from "@/features/news/domain/model/newsArticle"
import type { NewsIntent } from "@/features/news/domain/intent/newsIntent"

type FetchFn = (page: number) => void
type SaveFn = (article: NewsArticleItem) => void

export function createNewsCommand(
    fetch: FetchFn,
    save: SaveFn,
): Record<NewsIntent["type"], (intent: NewsIntent) => void> {
    return {
        FETCH_NEWS_LIST: (intent) => {
            if (intent.type === "FETCH_NEWS_LIST") fetch(intent.page)
        },
        CHANGE_PAGE: (intent) => {
            if (intent.type === "CHANGE_PAGE") fetch(intent.page)
        },
        SAVE_ARTICLE: (intent) => {
            if (intent.type === "SAVE_ARTICLE") save(intent.article)
        },
    }
}

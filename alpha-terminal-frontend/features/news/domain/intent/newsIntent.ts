import type { NewsArticleItem } from "@/features/news/domain/model/newsArticle"

export type NewsIntent =
    | { type: "FETCH_NEWS_LIST"; page: number }
    | { type: "CHANGE_PAGE"; page: number }
    | { type: "SAVE_ARTICLE"; article: NewsArticleItem }

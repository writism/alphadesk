import type { NewsArticleItem } from "@/features/news/domain/model/newsArticle"
import { getSafeUrl } from "@/infrastructure/utils/urlValidator"

interface Props {
    articles: NewsArticleItem[]
    isLoading: boolean
    error: string | null
}

export function NewsArticleList({ articles, isLoading, error }: Props) {
    if (isLoading) {
        return (
            <ul className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                    <li key={i} className="h-14 rounded bg-gray-100 animate-pulse" />
                ))}
            </ul>
        )
    }

    if (error) {
        return <p className="text-sm text-red-500">{error}</p>
    }

    if (articles.length === 0) {
        return <p className="text-sm text-gray-400">뉴스가 없습니다.</p>
    }

    return (
        <ul className="space-y-3">
            {articles.map((article, i) => (
                <li key={article.link ?? i} className="border-b pb-3">
                    <a
                        href={getSafeUrl(article.link)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-blue-600 hover:underline"
                    >
                        {article.title}
                    </a>
                    <div className="mt-1 flex gap-2 text-xs text-gray-400">
                        <span>{article.source}</span>
                        {article.published_at && <span>{article.published_at}</span>}
                    </div>
                </li>
            ))}
        </ul>
    )
}

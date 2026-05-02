import { httpClient } from "@/infrastructure/http/httpClient"
import type { ArticleAnalysis, NewsSearchResponse, SaveArticleRequest, SaveArticleResponse, SavedArticleListResponse, SaveInterestArticleRequest, SaveInterestArticleResponse } from "@/features/news/domain/model/newsArticle"

export async function searchNews(
    keyword: string,
    market: string | null,
    page: number = 1,
    page_size: number = 10
): Promise<NewsSearchResponse> {
    const params = new URLSearchParams({
        keyword,
        page: String(page),
        page_size: String(page_size),
    })
    if (market) params.set("market", market)
    const res = await httpClient.get(`/news/search?${params.toString()}`)
    return res.json()
}

export async function saveArticle(request: SaveArticleRequest): Promise<SaveArticleResponse> {
    const res = await httpClient.post("/news/saved", request)
    return res.json()
}

export async function saveInterestArticle(request: SaveInterestArticleRequest): Promise<SaveInterestArticleResponse> {
    const res = await httpClient.post("/news/interest-articles", request)
    return res.json()
}

export async function fetchSavedArticles(): Promise<SavedArticleListResponse> {
    const res = await httpClient.get("/news/saved")
    return res.json()
}

export async function analyzeArticle(articleId: number): Promise<ArticleAnalysis> {
    const res = await httpClient.get(`/news/saved/${articleId}/analysis`)
    return res.json()
}

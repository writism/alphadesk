"use client"

import { useSavedArticles } from "@/features/news/application/hooks/useSavedArticles"
import type { ArticleAnalysis, SavedArticleItem } from "@/features/news/domain/model/newsArticle"

function SentimentBadge({ sentiment, score }: { sentiment: string; score: number }) {
    const upper = sentiment.toUpperCase()
    const colorCls =
        upper === "POSITIVE"
            ? "text-primary"
            : upper === "NEGATIVE"
              ? "text-error"
              : "text-outline"
    const scoreStr = score >= 0 ? `+${score.toFixed(2)}` : score.toFixed(2)
    return (
        <span className={`font-mono text-xs font-bold uppercase ${colorCls}`}>
            {upper} <span className="font-normal">{scoreStr}</span>
        </span>
    )
}

function AnalysisResult({ analysis }: { analysis: ArticleAnalysis }) {
    return (
        <div className="mt-2 flex flex-col gap-1 border-l-2 border-outline pl-3">
            <div className="flex flex-wrap items-center gap-2">
                <SentimentBadge sentiment={analysis.sentiment} score={analysis.sentiment_score} />
            </div>
            {analysis.keywords.length > 0 && (
                <div className="flex flex-wrap gap-1">
                    {analysis.keywords.map((kw) => (
                        <span
                            key={kw}
                            className="font-mono text-xs border border-outline px-1.5 py-0.5 text-on-surface-variant"
                        >
                            {kw}
                        </span>
                    ))}
                </div>
            )}
        </div>
    )
}

function SavedArticleListItem({
    article,
    analysisState,
    onAnalyze,
}: {
    article: SavedArticleItem
    analysisState: ArticleAnalysis | "loading" | "error" | undefined
    onAnalyze: (id: number) => void
}) {
    const isAnalyzing = analysisState === "loading"
    const isError = analysisState === "error"
    const hasAnalysis = analysisState !== undefined && analysisState !== "loading" && analysisState !== "error"

    const analyzeDisabled = !article.has_content || isAnalyzing

    const analyzeLabel = isAnalyzing ? "ANALYZING..." : "ANALYZE"
    const analyzeCls = analyzeDisabled
        ? "border-outline text-outline cursor-not-allowed opacity-50"
        : "border-outline text-on-surface-variant hover:text-primary hover:border-primary"

    return (
        <li className="flex flex-col gap-2 border border-outline px-4 py-3">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex flex-col gap-1 min-w-0 flex-1">
                    <a
                        href={article.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-sm font-medium text-on-surface hover:text-primary line-clamp-2"
                    >
                        {article.title}
                    </a>
                    {article.snippet && (
                        <p className="font-mono text-xs text-on-surface-variant line-clamp-2">{article.snippet}</p>
                    )}
                    <div className="flex flex-wrap gap-3 font-mono text-xs text-outline">
                        <span>{article.source}</span>
                        {article.published_at && <span>{article.published_at}</span>}
                        <span>saved {new Date(article.saved_at).toLocaleDateString("ko-KR")}</span>
                    </div>
                </div>
                <button
                    type="button"
                    disabled={analyzeDisabled}
                    onClick={() => onAnalyze(article.id)}
                    title={!article.has_content ? "본문 없음" : undefined}
                    className={`shrink-0 font-mono text-xs px-3 py-1.5 border uppercase font-bold transition-none ${analyzeCls}`}
                >
                    {analyzeLabel}
                </button>
            </div>

            {hasAnalysis && <AnalysisResult analysis={analysisState as ArticleAnalysis} />}
            {isError && (
                <p className="font-mono text-xs text-error border-l-2 border-error pl-3 mt-1">
                    [ERROR] 분석에 실패했습니다.
                </p>
            )}
        </li>
    )
}

export function SavedArticlesPage() {
    const { items, isLoading, error, analyses, analyze } = useSavedArticles()

    return (
        <main className="max-w-3xl mx-auto p-6 pt-8 md:p-8">
            <div className="mb-6 border-b border-outline pb-4">
                <div className="font-headline font-bold text-on-surface text-xl uppercase tracking-tighter">
                    SAVED_ARTICLES
                </div>
                <div className="font-mono text-sm text-on-surface-variant mt-0.5">
                    저장된 뉴스 기사
                </div>
            </div>

            {error && (
                <div className="mb-4 px-3 py-2 border border-outline font-mono text-sm text-error">
                    [ERROR] {error}
                </div>
            )}

            {isLoading ? (
                <ul className="flex flex-col gap-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <li key={i} className="h-20 border border-outline bg-surface-container animate-pulse" />
                    ))}
                </ul>
            ) : !error && items.length === 0 ? (
                <p className="font-mono text-sm text-outline py-10 text-center border border-dashed border-outline">
                    저장된 기사가 없습니다.
                </p>
            ) : (
                <ul className="flex flex-col gap-2">
                    {items.map((article) => (
                        <SavedArticleListItem
                            key={article.id}
                            article={article}
                            analysisState={analyses[article.id]}
                            onAnalyze={analyze}
                        />
                    ))}
                </ul>
            )}
        </main>
    )
}

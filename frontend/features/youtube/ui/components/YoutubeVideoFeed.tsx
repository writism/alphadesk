"use client"

import { useAtom } from "jotai"
import { useWatchlist } from "@/features/watchlist/application/hooks/useWatchlist"
import { youtubeSelectedNameAtom, youtubeSortOrderAtom } from "@/features/youtube/application/atoms/youtubeAtom"
import { useYoutubeList } from "../../application/hooks/useYoutubeList"
import { YoutubeVideoCard } from "./YoutubeVideoCard"

export function YoutubeVideoFeed() {
    const { items: watchlistItems } = useWatchlist()
    const [selectedName, setSelectedName] = useAtom(youtubeSelectedNameAtom)
    const [sortOrder, setSortOrder] = useAtom(youtubeSortOrderAtom)

    const activeStock = selectedName ?? watchlistItems[0]?.name

    const { items: rawItems, nextPageToken, prevPageToken, totalResults, isLoading, error, goNext, goPrev } =
        useYoutubeList(activeStock)

    const items = [...rawItems].sort((a, b) => {
        const diff = new Date(a.published_at).getTime() - new Date(b.published_at).getTime()
        return sortOrder === "desc" ? -diff : diff
    })

    return (
        <main className="max-w-5xl mx-auto px-6 md:px-8 pt-6 pb-24 md:pb-8">
            <div className="mb-6 border-b border-outline pb-4 flex items-end justify-between gap-4">
                <div>
                    <div className="font-headline font-bold text-on-surface text-xl uppercase tracking-tighter">
                        VIDEOS
                    </div>
                    <div className="font-mono text-sm text-on-surface-variant mt-0.5">
                        관심종목 관련 최신 유튜브 영상을 확인하세요.
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => setSortOrder((o: "desc" | "asc") => (o === "desc" ? "asc" : "desc"))}
                    className="flex items-center gap-1 border border-outline px-3 py-1.5 font-mono text-xs uppercase text-on-surface-variant hover:border-primary hover:text-primary transition-none shrink-0"
                    title={sortOrder === "desc" ? "오래된순으로 변경" : "최신순으로 변경"}
                >
                    <span className="material-symbols-outlined text-[14px]">
                        {sortOrder === "desc" ? "arrow_downward" : "arrow_upward"}
                    </span>
                    {sortOrder === "desc" ? "최신순" : "오래된순"}
                </button>
            </div>

            {/* 관심종목 탭 */}
            {watchlistItems.length > 0 && (
                <div className="mb-6 flex flex-wrap gap-2">
                    {watchlistItems.map((stock) => (
                        <button
                            key={stock.id}
                            type="button"
                            onClick={() => setSelectedName(stock.name)}
                            className={`border font-mono text-sm px-3 py-1.5 uppercase transition-none ${
                                activeStock === stock.name
                                    ? "bg-primary border-primary text-white font-bold"
                                    : "border-outline text-on-surface-variant hover:border-primary hover:text-primary"
                            }`}
                        >
                            {stock.name}
                            <span className="ml-1.5 text-xs opacity-60">{stock.symbol}</span>
                        </button>
                    ))}
                </div>
            )}

            <section aria-label="영상 목록">
                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {Array.from({ length: 9 }).map((_, i) => (
                            <div key={i} className="bg-surface-container animate-pulse aspect-[4/3]" />
                        ))}
                    </div>
                ) : error ? (
                    <div className="border border-outline px-4 py-3 font-mono text-sm text-error">
                        [ERROR] {error}
                    </div>
                ) : items.length === 0 ? (
                    <div className="border border-dashed border-outline py-16 text-center">
                        <p className="font-mono text-sm text-outline">
                            {watchlistItems.length === 0
                                ? "관심종목을 먼저 등록해주세요."
                                : "표시할 영상이 없습니다."}
                        </p>
                    </div>
                ) : (
                    <>
                        {totalResults > 0 && (
                            <p className="mb-4 font-mono text-sm text-on-surface-variant">
                                <span className="font-bold text-on-surface">{activeStock}</span> 관련 영상 약{" "}
                                {totalResults.toLocaleString()}개
                            </p>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {items.map((video) => (
                                <YoutubeVideoCard key={video.video_url} video={video} />
                            ))}
                        </div>

                        {(prevPageToken || nextPageToken) && (
                            <nav className="mt-8 flex justify-center gap-2" aria-label="영상 페이지 이동">
                                <button
                                    type="button"
                                    onClick={goPrev}
                                    disabled={!prevPageToken}
                                    className="border border-outline px-5 py-2 font-mono text-sm uppercase disabled:opacity-40 hover:bg-surface-container"
                                >
                                    PREV
                                </button>
                                <button
                                    type="button"
                                    onClick={goNext}
                                    disabled={!nextPageToken}
                                    className="border border-outline px-5 py-2 font-mono text-sm uppercase disabled:opacity-40 hover:bg-surface-container"
                                >
                                    NEXT
                                </button>
                            </nav>
                        )}
                    </>
                )}
            </section>
        </main>
    )
}

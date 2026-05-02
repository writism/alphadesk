import type { TodayBriefing, BriefingStock } from "@/features/home/domain/model/todayBriefing"

function formatTime(isoString: string): string {
    return new Date(isoString).toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Seoul",
    })
}

function truncate(text: string, max = 60): string {
    return text.length <= max ? text : `${text.slice(0, max)}…`
}

const SOURCE_LABEL: Record<string, string> = {
    NEWS: "뉴스",
    DISCLOSURE: "공시",
    REPORT: "재무",
}

function StockRow({ stock, type }: { stock: BriefingStock; type: "positive" | "negative" }) {
    const scoreColor = type === "positive" ? "text-tertiary" : "text-primary"
    const badge = type === "positive" ? "text-tertiary border border-tertiary" : "text-primary border border-primary"
    const arrow = type === "positive" ? "AI+" : "AI-"
    const sourceLabel = stock.source_type ? SOURCE_LABEL[stock.source_type] : null

    return (
        <div className="flex flex-col gap-1 bg-surface-container px-3 py-2.5">
            <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                    <span className="shrink-0 font-mono text-sm font-bold text-on-surface">
                        {stock.symbol}
                    </span>
                    <span className="truncate font-mono text-sm text-on-surface-variant">
                        {stock.name}
                    </span>
                    {sourceLabel && (
                        <span className="shrink-0 font-mono px-1.5 py-0.5 text-xs border border-outline text-outline">
                            {sourceLabel}
                        </span>
                    )}
                </div>
                <div className="flex shrink-0 items-center gap-2 font-mono text-xs">
                    <span className={`px-1.5 py-0.5 font-bold uppercase ${badge}`}>
                        {arrow}
                    </span>
                    <span className={`font-bold ${scoreColor}`}>
                        {stock.sentiment_score > 0 ? "+" : ""}
                        {stock.sentiment_score.toFixed(2)}
                    </span>
                    <span className="text-outline">
                        신뢰 {Math.round(stock.confidence * 100)}%
                    </span>
                </div>
            </div>
            {stock.summary && (
                <p className="font-mono text-xs leading-relaxed text-outline">
                    {truncate(stock.summary)}
                </p>
            )}
        </div>
    )
}

type Props = {
    briefing: TodayBriefing
}

export function HomeTodayBriefing({ briefing }: Props) {
    const showPositive = briefing.positive.slice(0, 3)
    const showNegative = briefing.negative.slice(0, 2)

    return (
        <div className="border border-outline bg-surface-container-low px-5 py-4">
            {/* 헤더 */}
            <div className="mb-3 flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-on-surface uppercase tracking-widest">
                    TODAY_BRIEFING
                </span>
                <span className="font-mono text-xs text-outline">
                    {briefing.dateLabel}
                    {briefing.lastAnalyzedAt && (
                        <> · {formatTime(briefing.lastAnalyzedAt)} 분석</>
                    )}
                </span>
            </div>

            {/* 데이터 없음 */}
            {briefing.isEmpty ? (
                <div className="py-4 text-center">
                    <p className="font-mono text-sm text-on-surface-variant">
                        아직 오늘의 분석 데이터가 없습니다.
                    </p>
                    <p className="mt-0.5 font-mono text-xs text-outline">
                        매일 07:00 KST 자동 수집됩니다.
                    </p>
                </div>
            ) : (
                <>
                    {/* 분석 요약 바 */}
                    <div className="mb-3 flex flex-wrap gap-x-4 gap-y-0.5 font-mono text-sm">
                        <span className="text-on-surface-variant">
                            분석 <strong className="text-on-surface">{briefing.analyzedCount}</strong>종목
                        </span>
                        <span className="text-tertiary">긍정 {briefing.positive.length}</span>
                        <span className="text-on-surface-variant">중립 {briefing.neutral.length}</span>
                        <span className="text-primary">부정 {briefing.negative.length}</span>
                    </div>

                    {/* 주목 종목 */}
                    {showPositive.length > 0 && (
                        <div className="mb-3">
                            <p className="mb-1.5 font-mono text-xs font-bold text-tertiary uppercase tracking-widest">
                                SIGNAL+
                            </p>
                            <div className="flex flex-col gap-1">
                                {showPositive.map((s) => (
                                    <StockRow key={s.symbol} stock={s} type="positive" />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 리스크 종목 */}
                    {showNegative.length > 0 && (
                        <div>
                            <p className="mb-1.5 font-mono text-xs font-bold text-error uppercase tracking-widest">
                                RISK_ALERT
                            </p>
                            <div className="flex flex-col gap-1">
                                {showNegative.map((s) => (
                                    <StockRow key={s.symbol} stock={s} type="negative" />
                                ))}
                            </div>
                        </div>
                    )}

                    <p className="mt-3 font-mono text-xs text-outline">
                        * 투자 권유 아님. AI 분석 참고용 정보입니다.
                    </p>
                </>
            )}
        </div>
    )
}

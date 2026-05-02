import type { TopPick } from "@/features/home/domain/model/homeStats"

type Props = {
    topPicks: TopPick[]
}

export function HomeAlphaTopPicks({ topPicks }: Props) {
    if (!topPicks || topPicks.length === 0) return null

    return (
        <div className="border border-outline bg-surface-container-low px-5 py-4">
            <div className="mb-3 flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-on-surface uppercase tracking-widest">
                    ALPHA_OPPORTUNITY
                </span>
                <span className="font-mono text-xs text-outline">
                    score × 신뢰도 상위 3종목
                </span>
            </div>

            <div className="flex flex-col gap-1">
                {topPicks.map((pick, idx) => (
                    <div
                        key={`${pick.symbol}-${idx}`}
                        className="flex items-center justify-between gap-2 bg-surface-container px-3 py-2.5"
                    >
                        <div className="flex min-w-0 items-center gap-2">
                            <span className="shrink-0 font-mono text-sm font-bold text-on-surface">
                                {pick.symbol}
                            </span>
                            <span className="truncate font-mono text-sm text-on-surface-variant">
                                {pick.name}
                            </span>
                        </div>
                        <div className="flex shrink-0 items-center gap-2 font-mono text-xs">
                            <span className="border border-tertiary px-1.5 py-0.5 font-bold text-tertiary uppercase">
                                AI+
                            </span>
                            <span className="text-tertiary font-bold">
                                {pick.sentiment_score > 0 ? "+" : ""}
                                {pick.sentiment_score.toFixed(2)}
                            </span>
                            <span className="text-outline">
                                신뢰 {(pick.confidence * 100).toFixed(0)}%
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <p className="mt-3 font-mono text-xs text-outline">
                * 투자 권유 아님. AI 분석 참고용 정보입니다.
            </p>
        </div>
    )
}

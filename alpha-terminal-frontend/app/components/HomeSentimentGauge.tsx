import type { SentimentDistribution, SentimentGauge } from "@/features/home/domain/model/homeStats"

const GAUGE_LABEL_STYLE: Record<string, string> = {
    공포: "text-primary",
    중립: "text-on-surface-variant",
    탐욕: "text-tertiary",
}

type Props = {
    gauge: SentimentGauge
    distribution: SentimentDistribution
}

export function HomeSentimentGauge({ gauge, distribution }: Props) {
    const markerLeft = `${gauge.score}%`

    return (
        <div className="border border-outline bg-surface-container-low px-5 py-4">
            <div className="mb-3 flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-on-surface uppercase tracking-widest">
                    SENTIMENT_GAUGE
                </span>
                <span className="font-mono text-xs text-outline">
                    내 관심종목 기반
                </span>
            </div>

            {/* 게이지 바 */}
            <div className="relative mb-1 h-2 w-full overflow-visible bg-gradient-to-r from-primary-fixed-dim via-outline-variant to-tertiary-fixed-dim">
                <div
                    className="absolute -top-0.5 h-3 w-1 -translate-x-1/2 bg-on-surface"
                    style={{ left: markerLeft }}
                    aria-hidden
                />
            </div>

            {/* 레이블 */}
            <div className="mb-3 flex justify-between font-mono text-xs text-outline">
                <span>공포</span>
                <span>중립</span>
                <span>탐욕</span>
            </div>

            {/* 점수 + 레이블 */}
            <div className="mb-3 flex items-baseline gap-2">
                <span className={`font-mono text-3xl font-bold ${GAUGE_LABEL_STYLE[gauge.label]}`}>
                    {gauge.score}
                </span>
                <span className={`font-mono text-sm font-bold uppercase ${GAUGE_LABEL_STYLE[gauge.label]}`}>
                    {gauge.label}
                </span>
            </div>

            {/* 감성 분포 */}
            {distribution.total > 0 && (
                <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-sm">
                    <span className="text-tertiary">긍정 {distribution.positive}건</span>
                    <span className="text-on-surface-variant">중립 {distribution.neutral}건</span>
                    <span className="text-primary">부정 {distribution.negative}건</span>
                    <span className="text-outline">(총 {distribution.total}건 분석)</span>
                </div>
            )}
        </div>
    )
}

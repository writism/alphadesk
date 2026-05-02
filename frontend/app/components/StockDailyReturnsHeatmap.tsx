"use client"

import type { HeatmapItem } from "@/features/stock/domain/model/dailyReturnsHeatmap"

type Props = {
    item: HeatmapItem
    weeks: number
    /** 배치 응답의 전역 as_of; 카드에는 보통 넣지 않고 종목 시리즈 끝 날짜만 쓴다(BL-FE-34). */
    asOf?: string | null
    /** false면 범례 생략 — 섹션 상단 DailyReturnsHeatmapLegend 사용(BL-FE-34). */
    showLegend?: boolean
    /** BL-FE-38: 감성 예측 점수(-1~+1). 전달 시 히트맵 실제 등락 방향과 정합 뱃지를 표시한다. */
    sentimentScore?: number
}

type Direction = 'UP' | 'DOWN' | 'NEUTRAL'
type MatchResult = 'MATCH' | 'MISMATCH' | 'UNCLEAR'

function calcMatchResult(sentimentScore: number, up: number, down: number): MatchResult {
    const sentimentDir: Direction =
        sentimentScore > 0.1 ? 'UP' : sentimentScore < -0.1 ? 'DOWN' : 'NEUTRAL'
    if (sentimentDir === 'NEUTRAL') return 'UNCLEAR'

    const total = up + down
    if (total === 0) return 'UNCLEAR'
    const ratio = up / total
    const priceDir: Direction = ratio > 0.5 ? 'UP' : ratio < 0.5 ? 'DOWN' : 'NEUTRAL'
    if (priceDir === 'NEUTRAL') return 'UNCLEAR'

    return sentimentDir === priceDir ? 'MATCH' : 'MISMATCH'
}

const DIR_ARROW: Record<Direction, string> = { UP: '↑', DOWN: '↓', NEUTRAL: '' }

function MatchBadge({ sentimentScore, up, down }: { sentimentScore: number; up: number; down: number }) {
    const match = calcMatchResult(sentimentScore, up, down)
    if (match === 'UNCLEAR') return null

    const sentimentDir: Direction = sentimentScore > 0.1 ? 'UP' : 'DOWN'
    const total = up + down
    const priceDir: Direction = total > 0 && up / total > 0.55 ? 'UP' : 'DOWN'

    const label = `AI${DIR_ARROW[sentimentDir]} · 실제${DIR_ARROW[priceDir]} ${match === 'MATCH' ? '✓' : '✗'}`
    const style =
        match === 'MATCH'
            ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300'
            : 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'

    return (
        <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 ${style}`}>
            {label}
        </span>
    )
}

/** 국내 관습: 상승 빨강, 하락 파랑 */
const BUCKET_CELL: Record<number, string> = {
    2: "bg-red-600 dark:bg-red-500",
    1: "bg-red-400/90 dark:bg-red-400/80",
    0: "bg-gray-500/35 dark:bg-gray-500/45",
    [-1]: "bg-blue-400/90 dark:bg-blue-400/80",
    [-2]: "bg-blue-600 dark:bg-blue-500",
}

const BUCKET_LABEL_KO: Record<number, string> = {
    2: "큰 폭 상승",
    1: "소폭 상승",
    0: "보합·미미",
    [-1]: "소폭 하락",
    [-2]: "큰 폭 하락",
}

const KR_MARKETS = new Set(["KOSPI", "KOSDAQ", "KONEX"])

function bucketTooltip(day: string, bucket: number): string {
    const step = BUCKET_LABEL_KO[bucket] ?? "알 수 없음"
    return `${day} · 전일 대비 등락 분위: ${step}`
}

export function StockDailyReturnsHeatmap({ item, weeks, asOf = null, showLegend = false, sentimentScore }: Props) {
    // 한 줄형 일자 시퀀스가 기본이며, 폭이 좁아지면 wrap으로 2줄/3줄로 내려간다.
    const cells = [...item.series].sort((a, b) => a[0].localeCompare(b[0]))
    /** 히트맵에 포함된 가장 최근 거래일(각 칸은 그날 종가 vs 직전 거래일 종가). */
    const anchor = asOf ?? cells[cells.length - 1]?.[0]
    if (!anchor) return null

    const label = `최근 약 ${weeks}주 거래일별 전일 대비 등락 분위. 상승 경향 ${item.summary.up}일, 하락 경향 ${item.summary.down}일, 보합 ${item.summary.flat}일. 마지막 포함 거래일 ${anchor}.`

    const showKrNote = KR_MARKETS.has(item.market)

    return (
        <div className="mt-1" role="img" aria-label={label}>
            <div className="flex flex-wrap items-start justify-between gap-x-2 gap-y-0.5 mb-1">
                <span className="text-[10px] font-medium text-gray-600 dark:text-gray-300">
                    최근 거래일 등락 분위
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                    {sentimentScore !== undefined && (
                        <MatchBadge
                            sentimentScore={sentimentScore}
                            up={item.summary.up}
                            down={item.summary.down}
                        />
                    )}
                    <span
                        className="text-[10px] text-gray-400 dark:text-gray-500 tabular-nums text-right max-w-[11rem] leading-tight"
                        title="이 날짜는 히트맵에 담긴 가장 최근 거래일입니다. 각 칸은 그날의 전 거래일 종가 대비 등락 분위(상대 강도)입니다."
                    >
                        마지막 거래일 {anchor}
                    </span>
                </div>
            </div>
            <div className="flex max-w-full flex-wrap gap-0.5">
                {cells.map(([day, bucket]) => (
                    <div
                        key={day}
                        title={bucketTooltip(day, bucket)}
                        className={`h-2.5 w-2.5 shrink-0 rounded-[2px] ${BUCKET_CELL[bucket] ?? "bg-gray-500/30"}`}
                    />
                ))}
            </div>
            {showLegend && (
                <div
                    className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[9px] text-gray-500 dark:text-gray-400"
                    aria-hidden
                >
                    <span className="inline-flex items-center gap-1">
                        <span className="h-2 w-2 shrink-0 rounded-[2px] bg-blue-600 dark:bg-blue-500" />
                        하락
                    </span>
                    <span className="inline-flex items-center gap-1">
                        <span className="h-2 w-2 shrink-0 rounded-[2px] bg-gray-500/45 dark:bg-gray-500/45" />
                        보합
                    </span>
                    <span className="inline-flex items-center gap-1">
                        <span className="h-2 w-2 shrink-0 rounded-[2px] bg-red-600 dark:bg-red-500" />
                        상승
                    </span>
                    <span className="text-gray-400 dark:text-gray-500">(색 농도 = 변동 강도)</span>
                </div>
            )}
            {showKrNote && (
                <p className="mt-1 text-[9px] leading-snug text-gray-400 dark:text-gray-500">
                    한국장 데이터는 공시·지연에 따라 전일 종가 기준일 수 있습니다.
                </p>
            )}
        </div>
    )
}

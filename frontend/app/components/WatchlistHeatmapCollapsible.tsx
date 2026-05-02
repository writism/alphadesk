'use client'

import type { HeatmapItem } from '@/features/stock/domain/model/dailyReturnsHeatmap'
import { StockDailyReturnsHeatmap } from './StockDailyReturnsHeatmap'

type Props = {
    item: HeatmapItem
    weeks: number
    /** 생략 시 종목 시리즈의 마지막 거래일 사용(BL-FE-34) */
    asOf?: string | null
}

/** BL-FE-32: sm 미만에서는 접어 두고, sm 이상에서는 항상 펼침(두 뷰포트 각각 인스턴스 1개). */
export function WatchlistHeatmapCollapsible({ item, weeks, asOf = null }: Props) {
    return (
        <>
            <div className="hidden sm:block">
                <StockDailyReturnsHeatmap item={item} weeks={weeks} asOf={asOf} showLegend={false} />
            </div>
            <details className="sm:hidden rounded-md border border-gray-200 bg-gray-50/50 px-2 py-1.5 dark:border-gray-600 dark:bg-gray-900/40">
                <summary className="cursor-pointer select-none text-xs font-medium text-gray-600 dark:text-gray-300 list-none [&::-webkit-details-marker]:hidden">
                    일별 등락 히트맵 보기
                </summary>
                <div className="pt-2">
                    <StockDailyReturnsHeatmap item={item} weeks={weeks} asOf={asOf} showLegend={false} />
                </div>
            </details>
        </>
    )
}

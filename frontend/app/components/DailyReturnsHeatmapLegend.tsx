'use client'

/** BL-FE-34: 섹션당 1회 — 카드 밖에 두어 반복 노이즈 제거 */
export function DailyReturnsHeatmapLegend({ className = '' }: { className?: string }) {
    return (
        <div
            className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-gray-600 dark:text-gray-400 ${className}`}
            aria-label="일별 등락 히트맵 범례"
        >
            <span className="font-medium text-gray-700 dark:text-gray-300">히트맵 범례</span>
            <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 shrink-0 rounded-[2px] bg-blue-600 dark:bg-blue-500" />
                하락(전일 대비)
            </span>
            <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 shrink-0 rounded-[2px] bg-gray-500/45 dark:bg-gray-500/45" />
                보합·미미
            </span>
            <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 shrink-0 rounded-[2px] bg-red-600 dark:bg-red-500" />
                상승(전일 대비)
            </span>
            <span className="text-gray-500 dark:text-gray-500">색 농도 = 변동 강도</span>
        </div>
    )
}

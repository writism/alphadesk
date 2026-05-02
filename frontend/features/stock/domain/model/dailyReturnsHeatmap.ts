export type DailyReturnBucket = -2 | -1 | 0 | 1 | 2

export interface HeatmapSummary {
    up: number
    down: number
    flat: number
}

export interface HeatmapItem {
    symbol: string
    market: string
    series: [string, DailyReturnBucket][]
    summary: HeatmapSummary
}

export interface HeatmapErrorItem {
    symbol: string
    code: string
    message: string
}

export interface DailyReturnsHeatmapResponse {
    as_of: string | null
    weeks: number
    items: HeatmapItem[]
    errors: HeatmapErrorItem[]
}

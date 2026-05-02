import type { AnalysisLog } from "@/features/dashboard/domain/model/stockSummary"

export interface StockDetail {
    symbol: string
    name: string
    market?: string | null
    analysis_logs: AnalysisLog[]
}

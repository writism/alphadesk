import { httpClient } from "@/infrastructure/http/httpClient"
import type { AnalysisAnswer } from "../../domain/model/analysisAnswer"

export async function askMarketAnalysis(question: string): Promise<AnalysisAnswer> {
    const res = await httpClient.post("/market-analysis/ask", { question })
    if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error((err as { detail?: string }).detail || "질문 처리에 실패했습니다.")
    }
    return res.json()
}

import { env } from "@/infrastructure/config/env"
import { httpClient } from "@/infrastructure/http/httpClient"
import type { InvestmentDecisionResult } from "@/features/invest/domain/model/investJudgment"

export type StreamEvent =
    | { type: "log"; data: string }
    | { type: "result"; data: string }
    | { type: "error"; data: string }
    | { type: "end" }

export async function requestInvestmentDecision(query: string): Promise<InvestmentDecisionResult> {
    const res = await httpClient.post("/investment/decision", { query })
    if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error((err as { detail?: string }).detail || "투자 판단 요청에 실패했습니다.")
    }
    return res.json()
}

export async function* streamInvestmentDecision(query: string): AsyncGenerator<StreamEvent> {
    const res = await fetch(`${env.apiBaseUrl}/investment/decision/stream`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
    })

    if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error((err as { detail?: string }).detail || "투자 판단 요청에 실패했습니다.")
    }

    if (!res.body) {
        throw new Error("응답 본문 스트림을 사용할 수 없습니다.")
    }
    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ""

    while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const chunks = buffer.split("\n\n")
        buffer = chunks.pop() ?? ""

        for (const chunk of chunks) {
            const line = chunk.trim()
            if (line.startsWith("data: ")) {
                try {
                    yield JSON.parse(line.slice(6)) as StreamEvent
                } catch {
                    // 파싱 실패한 청크는 무시
                }
            }
        }
    }
}

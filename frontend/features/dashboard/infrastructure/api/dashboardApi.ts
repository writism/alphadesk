import { readApiError } from "@/infrastructure/http/apiError"
import { httpClient } from "@/infrastructure/http/httpClient"
import type { PipelineProgressEvent } from "../../domain/model/pipelineProgressEvent"
import type { AnalysisLog, StockSummary, PipelineResult } from "../../domain/model/stockSummary"

export async function fetchDashboardSummaries(): Promise<StockSummary[]> {
    const res = await httpClient.get("/pipeline/summaries")
    return (await res.json()) as StockSummary[]
}

export async function fetchReportSummaries(): Promise<StockSummary[]> {
    const res = await httpClient.get("/pipeline/report-summaries")
    return (await res.json()) as StockSummary[]
}

export async function runPipeline(symbols?: string[], articleMode?: string): Promise<PipelineResult> {
    const body: Record<string, unknown> = {}
    if (symbols && symbols.length > 0) body.symbols = symbols
    if (articleMode) body.article_mode = articleMode
    const res = await httpClient.post("/pipeline/run", Object.keys(body).length ? body : undefined)
    return (await res.json()) as PipelineResult
}

export async function fetchAnalysisLogs(): Promise<AnalysisLog[]> {
    const res = await httpClient.get("/pipeline/logs")
    return (await res.json()) as AnalysisLog[]
}

export interface PipelineProgressResponse {
    messages: string[]
    done: boolean
}

export async function fetchPipelineProgress(): Promise<PipelineProgressResponse> {
    const res = await httpClient.get("/pipeline/progress")
    return (await res.json()) as PipelineProgressResponse
}

export type RunPipelineStreamResult =
    | { used: false }
    | { used: true; streamError?: string }

/**
 * BL-BE-12: NDJSON(`application/x-ndjson` 또는 줄바꿈 구분 JSON) 스트림.
 * 엔드포인트가 없으면 `{ used: false }`(404).
 */
export async function runPipelineStream(
    symbols: string[] | undefined,
    onEvent: (event: PipelineProgressEvent) => void,
    articleMode?: string,
): Promise<RunPipelineStreamResult> {
    const body: Record<string, unknown> = {}
    if (symbols && symbols.length > 0) body.symbols = symbols
    if (articleMode) body.article_mode = articleMode
    const res = await fetch(`/api/pipeline/run-stream`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    })

    if (res.status === 404) return { used: false }
    if (!res.ok) throw await readApiError(res)

    const reader = res.body?.getReader()
    if (!reader) return { used: false }

    const decoder = new TextDecoder()
    let buffer = ""

    const flushLine = (line: string): string | undefined => {
        const trimmed = line.trim()
        if (!trimmed) return undefined
        let payload = trimmed
        if (trimmed.startsWith("data:")) {
            payload = trimmed.slice(5).trim()
        }
        try {
            const obj = JSON.parse(payload) as PipelineProgressEvent
            if (obj && typeof obj === "object" && typeof obj.type === "string" && typeof obj.message === "string") {
                const normalized: PipelineProgressEvent = {
                    ...obj,
                    at: obj.at || new Date().toISOString(),
                }
                onEvent(normalized)
                if (normalized.type === "error") return normalized.message
                if (normalized.type === "done") return "__done__"
            }
        } catch {
            /* skip malformed chunk */
        }
        return undefined
    }

    while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const parts = buffer.split("\n")
        buffer = parts.pop() ?? ""
        for (const part of parts) {
            const sig = flushLine(part)
            if (sig === "__done__") return { used: true }
            if (sig !== undefined && sig !== "__done__") return { used: true, streamError: sig }
        }
    }
    if (buffer.trim()) {
        for (const part of buffer.split("\n")) {
            const sig = flushLine(part)
            if (sig === "__done__") return { used: true }
            if (sig !== undefined && sig !== "__done__") return { used: true, streamError: sig }
        }
    }

    return { used: true }
}

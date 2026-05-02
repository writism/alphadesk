import { atom } from "jotai"
import type { PipelineProgressEvent } from "../../domain/model/pipelineProgressEvent"
import type { PipelineResult } from "../../domain/model/stockSummary"

export type ArticleMode = "latest_1" | "latest_3" | "latest_5" | "last_24h"

export const ARTICLE_MODE_OPTIONS: { value: ArticleMode; label: string }[] = [
    { value: "latest_1", label: "종목당 최신 1건" },
    { value: "latest_3", label: "종목당 최신 3건" },
    { value: "latest_5", label: "종목당 최신 5건" },
    { value: "last_24h", label: "종목당 24시간 전체" },
]

export const pipelineRunningAtom = atom<boolean>(false)
export const pipelineProgressEventsAtom = atom<PipelineProgressEvent[]>([])
export const pipelineResultAtom = atom<PipelineResult | null>(null)
export const pipelineElapsedSecondsAtom = atom<number | null>(null)
export const pipelineErrorAtom = atom<string | null>(null)
export const articleModeAtom = atom<ArticleMode>("latest_3")

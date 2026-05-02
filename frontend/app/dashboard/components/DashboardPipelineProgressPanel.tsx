"use client"

import type { PipelineProgressEvent } from "@/features/dashboard/domain/model/pipelineProgressEvent"

type Props = {
    events: PipelineProgressEvent[]
}

function formatAt(iso: string): string {
    try {
        const d = new Date(iso)
        if (Number.isNaN(d.getTime())) return iso
        return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    } catch {
        return iso
    }
}

export function DashboardPipelineProgressPanel({ events }: Props) {
    if (events.length === 0) return null

    return (
        <div
            role="status"
            aria-live="polite"
            aria-busy="true"
            className="mb-4 max-h-48 overflow-y-auto rounded-lg border border-blue-200 bg-blue-50/80 px-3 py-2 text-sm dark:border-blue-800 dark:bg-blue-950/50"
        >
            <p className="mb-2 font-medium text-blue-900 dark:text-blue-200">진행 상황</p>
            <ul className="space-y-1.5 text-blue-800 dark:text-blue-100">
                {events.map((e, i) => (
                    <li key={`${e.at}-${i}-${e.message.slice(0, 24)}`} className="flex gap-2">
                        <time className="shrink-0 font-mono text-xs text-blue-600 dark:text-blue-400" dateTime={e.at}>
                            {formatAt(e.at)}
                        </time>
                        <span className="min-w-0 break-words">{e.message}</span>
                    </li>
                ))}
            </ul>
        </div>
    )
}

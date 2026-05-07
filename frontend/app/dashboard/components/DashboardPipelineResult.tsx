import type { PipelineResult } from "@/features/dashboard/domain/model/stockSummary"

type Props = {
    running: boolean
    pipelineResult: PipelineResult | null
    allSkipped: boolean
    elapsedSeconds: number | null
}

export function DashboardPipelineResult({ running, pipelineResult, allSkipped, elapsedSeconds }: Props) {
    if (running || !pipelineResult) return null

    const successCount = pipelineResult.processed.filter((p) => !p.skipped).length
    const skippedCount = pipelineResult.processed.filter((p) => p.skipped).length

    return (
        <div className="mb-6 border border-outline overflow-hidden">
            {/* 헤더 */}
            <div className="px-4 py-2 bg-surface-container border-b border-outline-variant flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-on-surface uppercase tracking-widest">
                    PIPELINE_RESULT
                </span>
                <div className="flex items-center gap-3">
                    {elapsedSeconds !== null && (
                        <span className="font-mono text-[10px] text-outline">
                            {elapsedSeconds}s elapsed
                        </span>
                    )}
                    {allSkipped ? (
                        <span className="font-mono text-[10px] font-bold text-error border border-error px-1.5 py-0.5">
                            ALL_FAILED
                        </span>
                    ) : (
                        <span className="font-mono text-[10px] font-bold text-primary border border-primary px-1.5 py-0.5">
                            {successCount}_OK
                            {skippedCount > 0 && (
                                <span className="ml-1 text-outline font-normal">
                                    / {skippedCount}_SKIP
                                </span>
                            )}
                        </span>
                    )}
                </div>
            </div>

            {/* 종목별 결과 */}
            <ul className="divide-y divide-outline-variant">
                {pipelineResult.processed.map((item) => (
                    <li key={item.symbol} className="flex items-center gap-3 px-4 py-2">
                        <span className="font-mono text-xs font-bold text-on-surface w-20 shrink-0">
                            {item.symbol}
                        </span>
                        {item.skipped ? (
                            <>
                                <span className="font-mono text-[10px] border border-error text-error px-1.5 py-0.5 uppercase shrink-0">
                                    SKIP
                                </span>
                                <span className="font-mono text-xs text-on-surface-variant truncate">
                                    {item.reason ?? "알 수 없는 오류"}
                                </span>
                            </>
                        ) : (
                            <span className="font-mono text-[10px] border border-primary text-primary px-1.5 py-0.5 uppercase">
                                OK
                            </span>
                        )}
                    </li>
                ))}
            </ul>

            {/* 전체 실패 경고 */}
            {allSkipped && (
                <div className="px-4 py-3 border-t border-outline-variant bg-surface-container font-mono text-xs text-error">
                    [!] 모든 종목의 분석이 실패했습니다 — 백엔드 수집·AI 서비스 상태를 확인하세요.
                </div>
            )}
        </div>
    )
}

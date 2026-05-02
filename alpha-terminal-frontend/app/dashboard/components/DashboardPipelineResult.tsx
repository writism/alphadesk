import type { PipelineResult } from "@/features/dashboard/domain/model/stockSummary"

type Props = {
    running: boolean
    pipelineResult: PipelineResult | null
    allSkipped: boolean
    elapsedSeconds: number | null
}

export function DashboardPipelineResult({ running, pipelineResult, allSkipped, elapsedSeconds }: Props) {
    if (running || !pipelineResult) return null

    return (
        <div className="mb-6 border rounded-lg overflow-hidden dark:border-gray-700">
            <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">파이프라인 실행 결과</span>
                <div className="flex items-center gap-3">
                    {elapsedSeconds !== null && (
                        <span className="text-xs text-gray-400">
                            총 {elapsedSeconds}초 소요
                        </span>
                    )}
                    {allSkipped ? (
                        <span className="text-xs text-red-500 font-medium">전체 분석 실패</span>
                    ) : (
                        <span className="text-xs text-green-600 font-medium">
                            {pipelineResult.processed.filter((p) => !p.skipped).length}개 성공
                            {pipelineResult.processed.filter((p) => p.skipped).length > 0 && (
                                <span className="ml-1 text-gray-400">
                                    ({pipelineResult.processed.filter((p) => p.skipped).length}개 중복 건너뜀)
                                </span>
                            )}
                        </span>
                    )}
                </div>
            </div>
            <ul className="divide-y dark:divide-gray-700">
                {pipelineResult.processed.map((item) => (
                    <li key={item.symbol} className="flex items-center gap-3 px-4 py-2.5">
                        <span className="font-mono text-sm font-semibold w-20 text-gray-600 dark:text-gray-400">
                            {item.symbol}
                        </span>
                        {item.skipped ? (
                            <>
                                <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400">
                                    스킵
                                </span>
                                <span className="text-sm text-gray-500">{item.reason ?? "알 수 없는 오류"}</span>
                            </>
                        ) : (
                            <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400">
                                분석 완료
                            </span>
                        )}
                    </li>
                ))}
            </ul>
            {allSkipped && (
                <div className="px-4 py-3 bg-yellow-50 border-t dark:bg-yellow-950 dark:border-gray-700 text-sm text-yellow-700 dark:text-yellow-400">
                    모든 종목의 분석이 실패했습니다. 백엔드 뉴스 수집 또는 AI 서비스 상태를 확인해 주세요.
                </div>
            )}
        </div>
    )
}

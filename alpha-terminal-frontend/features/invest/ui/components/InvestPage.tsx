"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAtomValue, useSetAtom } from "jotai"
import { authStateAtom } from "@/features/auth/application/atoms/authAtom"
import { investIsLoadingAtom } from "@/features/invest/application/atoms/investJudgmentAtom"
import { useInvestJudgment } from "@/features/invest/application/hooks/useInvestJudgment"

// 로그 접두사 → 색상 매핑
function getLogColor(line: string): string {
    if (line.startsWith("[Orchestrator]")) return "text-primary"
    if (line.startsWith("[QueryParser]")) return "text-yellow-500"
    if (line.startsWith("[Retrieval]")) return "text-cyan-500"
    if (line.startsWith("[Analysis]")) return "text-purple-400"
    if (line.startsWith("[Synthesis]")) return "text-green-400"
    if (line.startsWith("[InvestmentGraph]")) return "text-on-surface-variant"
    return "text-on-surface-variant"
}

function AgentLogPanel({ logs, isLoading }: { logs: string[], isLoading: boolean }) {
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [logs])

    return (
        <div className="border border-outline bg-surface-container">
            {/* 헤더 */}
            <div className="flex items-center gap-2 px-4 py-2 border-b border-outline-variant bg-surface-container-high">
                <span className={`w-3 h-3 border-2 border-primary border-t-transparent rounded-full shrink-0 ${isLoading ? "animate-spin" : ""}`} />
                <span className="font-mono text-xs font-bold text-primary uppercase tracking-widest">
                    AGENT LOG
                </span>
                <span className="ml-auto font-mono text-[10px] text-outline">{logs.length} lines</span>
            </div>

            {/* 로그 스크롤 영역 */}
            <div
                ref={scrollRef}
                className="px-4 py-3 font-mono text-xs leading-5 overflow-y-auto max-h-72 space-y-0.5 bg-black/5"
            >
                {logs.length === 0 ? (
                    <div className="text-outline">워크플로우 초기화 중...</div>
                ) : (
                    logs.map((line, i) => (
                        <div key={i} className={`whitespace-pre-wrap break-all ${getLogColor(line)}`}>
                            {line}
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

export function InvestPage() {
    const authState = useAtomValue(authStateAtom)
    const setIsLoading = useSetAtom(investIsLoadingAtom)
    const router = useRouter()
    const { query, setQuery, result, isLoading, error, logs, submit, reset } = useInvestJudgment()

    useEffect(() => {
        if (authState.status === "UNAUTHENTICATED") {
            router.replace("/login")
        }
        if (authState.status === "PENDING_TERMS") {
            router.replace("/terms")
        }
    }, [authState.status, router])

    // SSE 스트림 진행 중 페이지 이탈 시 isLoading 정리
    useEffect(() => {
        return () => { setIsLoading(false) }
    }, [setIsLoading])

    if (authState.status !== "AUTHENTICATED") return null

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault()
            submit()
        }
    }

    const isEmpty = !query.trim()

    return (
        <main className="max-w-5xl mx-auto px-6 md:px-8 pt-6 pb-24 md:pb-8">
            <header className="mb-6 border-b border-outline pb-4">
                <div className="font-headline font-bold text-on-surface text-xl uppercase tracking-tighter">
                    INVEST
                </div>
                <div className="font-mono text-sm text-on-surface-variant mt-0.5">
                    AI 멀티 에이전트가 투자 판단을 분석합니다.
                </div>
            </header>

            {/* 질문 입력 영역 */}
            <section className="mb-4">
                <div className="font-mono text-xs font-bold text-on-surface uppercase tracking-widest mb-2">
                    PROMPT_INPUT
                </div>
                <div className="border border-outline bg-surface-container-lowest focus-within:border-primary">
                    <textarea
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="투자 판단이 필요한 질문을 입력하세요 (예: 삼성전자 지금 매수해도 될까요?)"
                        rows={4}
                        disabled={isLoading}
                        className="w-full bg-transparent outline-none font-mono text-sm text-on-surface placeholder:text-outline resize-none px-3 py-2.5 disabled:opacity-50"
                    />
                    <div className="flex items-center justify-between px-3 py-2 border-t border-outline-variant">
                        <span className="font-mono text-xs text-outline">
                            Ctrl+Enter 로 전송
                        </span>
                        <div className="flex items-center gap-2">
                            {(result || logs.length > 0) && (
                                <button
                                    type="button"
                                    onClick={reset}
                                    className="font-mono text-[10px] text-on-surface-variant border border-outline-variant px-3 py-1.5 uppercase hover:bg-surface-container-high transition-none"
                                >
                                    초기화
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={submit}
                                disabled={isEmpty || isLoading}
                                className="font-mono text-[10px] font-bold px-4 py-1.5 uppercase border transition-none
                                    bg-primary border-primary text-white
                                    disabled:opacity-40 disabled:cursor-not-allowed
                                    enabled:hover:opacity-90"
                            >
                                {isLoading ? "분석 중..." : "요청하기"}
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* 에러 */}
            {error && (
                <div className="mb-4 border border-error px-4 py-3 font-mono text-sm text-error">
                    [ERROR] {error}
                </div>
            )}

            {/* 에이전트 로그 (로딩 중 + 결과 표시 후에도 유지) */}
            {logs.length > 0 && (
                <div className="mb-4">
                    <AgentLogPanel logs={logs} isLoading={isLoading} />
                </div>
            )}

            {/* 결과 */}
            {result && !isLoading && (
                <section className="border border-outline bg-surface-container-low">
                    <div className="flex items-center gap-2 px-4 py-2 border-b border-outline-variant bg-primary/10">
                        <span className="material-symbols-outlined text-[14px] text-primary">
                            account_balance
                        </span>
                        <span className="font-mono text-xs font-bold text-on-surface uppercase tracking-widest">
                            DECISION_RESULT
                        </span>
                    </div>
                    <div className="px-4 py-2 border-b border-outline-variant bg-surface-container">
                        <span className="font-mono text-xs text-outline">Q. </span>
                        <span className="font-mono text-xs text-on-surface-variant">{query}</span>
                    </div>
                    <div className="px-4 py-4 font-mono text-sm text-on-surface leading-relaxed whitespace-pre-wrap">
                        {result.answer}
                    </div>
                </section>
            )}
        </main>
    )
}

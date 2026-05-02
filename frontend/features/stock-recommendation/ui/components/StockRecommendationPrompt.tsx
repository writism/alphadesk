"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAtomValue } from "jotai"
import { authStateAtom } from "@/features/auth/application/atoms/authAtom"
import { useMarketAnalysis } from "../../application/hooks/useMarketAnalysis"

export function StockRecommendationPrompt() {
    const authState = useAtomValue(authStateAtom)
    const router = useRouter()
    const { question, setQuestion, answer, isLoading, error, submit, reset } = useMarketAnalysis()

    // LOADING 중에는 리다이렉트 하지 않음 — AuthProvider가 /me 응답 받을 때까지 대기
    useEffect(() => {
        if (authState.status === "UNAUTHENTICATED") {
            router.replace("/login")
        }
        if (authState.status === "PENDING_TERMS") {
            router.replace("/terms")
        }
    }, [authState.status, router])

    // LOADING 또는 리다이렉트 직전에는 렌더하지 않음 (flash 방지)
    if (authState.status !== "AUTHENTICATED") return null

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault()
            submit()
        }
    }

    const isEmpty = !question.trim()

    return (
        <main className="max-w-5xl mx-auto px-6 md:px-8 pt-6 pb-24 md:pb-8">
            <header className="mb-6 border-b border-outline pb-4">
                <div className="font-headline font-bold text-on-surface text-xl uppercase tracking-tighter">
                    STOCK_PICKS
                </div>
                <div className="font-mono text-sm text-on-surface-variant mt-0.5">
                    관심종목 테마를 기반으로 AI가 질문에 답변합니다.
                </div>
            </header>

            {/* 질문 입력 영역 */}
            <section className="mb-4">
                <div className="font-mono text-xs font-bold text-on-surface uppercase tracking-widest mb-2">
                    QUERY_INPUT
                </div>
                <div className="border border-outline bg-surface-container-lowest focus-within:border-primary">
                    <textarea
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="관심종목 관련 질문을 입력하세요 (예: 방산주 최근 동향은?)"
                        rows={4}
                        disabled={isLoading}
                        className="w-full bg-transparent outline-none font-mono text-sm text-on-surface placeholder:text-outline resize-none px-3 py-2.5 disabled:opacity-50"
                    />
                    <div className="flex items-center justify-between px-3 py-2 border-t border-outline-variant">
                        <span className="font-mono text-xs text-outline">
                            Ctrl+Enter 로 전송
                        </span>
                        <div className="flex items-center gap-2">
                            {answer && (
                                <button
                                    type="button"
                                    onClick={reset}
                                    className="font-mono text-xs text-on-surface-variant border border-outline-variant px-2 py-1 uppercase hover:bg-surface-container-high transition-none"
                                >
                                    초기화
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={submit}
                                disabled={isEmpty || isLoading}
                                className="font-mono text-xs font-bold px-4 py-1 uppercase border transition-none
                                    bg-primary border-primary text-white
                                    disabled:opacity-40 disabled:cursor-not-allowed
                                    enabled:hover:opacity-90"
                            >
                                {isLoading ? "분석 중..." : "전송"}
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

            {/* 로딩 */}
            {isLoading && (
                <div className="border border-outline-variant bg-surface-container px-4 py-6 flex items-center gap-3">
                    <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin shrink-0" />
                    <span className="font-mono text-sm text-on-surface-variant">AI가 분석 중입니다...</span>
                </div>
            )}

            {/* 답변 */}
            {answer && !isLoading && (
                <section className="border border-outline bg-surface-container-low">
                    <div className={`flex items-center gap-2 px-4 py-2 border-b border-outline-variant ${
                        answer.in_scope ? "bg-primary/10" : "bg-surface-container"
                    }`}>
                        <span className="material-symbols-outlined text-[14px] text-primary">
                            {answer.in_scope ? "check_circle" : "info"}
                        </span>
                        <span className="font-mono text-xs font-bold text-on-surface uppercase tracking-widest">
                            {answer.in_scope ? "ANALYSIS_RESULT" : "OUT_OF_SCOPE"}
                        </span>
                        {answer.is_personalized && (
                            <span className="ml-auto font-mono text-[10px] font-bold text-primary border border-primary px-1.5 py-0.5 uppercase tracking-widest">
                                PERSONALIZED
                            </span>
                        )}
                    </div>
                    <div className="px-4 py-2 border-b border-outline-variant bg-surface-container">
                        <span className="font-mono text-xs text-outline">Q. </span>
                        <span className="font-mono text-xs text-on-surface-variant">{answer.question}</span>
                    </div>
                    <div className="px-4 py-4 font-mono text-sm text-on-surface leading-relaxed whitespace-pre-wrap">
                        {answer.answer}
                    </div>
                </section>
            )}
        </main>
    )
}

"use client"

import Link from "next/link"
import { useHome } from "@/features/home/application/hooks/useHome"
import { HomeSentimentGauge } from "@/app/components/HomeSentimentGauge"
import { HomeAlphaTopPicks } from "@/app/components/HomeAlphaTopPicks"
import { HomeTodayBriefing } from "@/app/components/HomeTodayBriefing"

function Skeleton() {
    return (
        <div className="space-y-3">
            <div className="h-36 bg-surface-container animate-pulse" />
            <div className="h-36 bg-surface-container animate-pulse" />
        </div>
    )
}

function FeatureHighlights() {
    const features = [
        { icon: "show_chart", title: "SENTIMENT_GAUGE", desc: "AI가 분석한 관심종목의 공포/탐욕 지수를 실시간으로 확인합니다." },
        { icon: "auto_awesome", title: "AI_INSIGHT", desc: "멀티에이전트 심층분석으로 매수·매도·보유 판단을 제공합니다." },
        { icon: "auto_stories", title: "TODAY_BRIEFING", desc: "매일 설정한 시간에 내 관심종목 AI 브리핑을 자동 수신합니다." },
        { icon: "feed", title: "MARKET_FEED", desc: "관심종목 기반 뉴스와 유튜브 영상을 한곳에서 확인합니다." },
    ]
    return (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {features.map((f) => (
                <div key={f.title} className="border border-outline bg-surface-container-low px-4 py-3 flex gap-3 items-start">
                    <span className="material-symbols-outlined text-[18px] text-primary shrink-0 mt-0.5">{f.icon}</span>
                    <div>
                        <div className="font-mono text-xs font-bold text-on-surface uppercase tracking-widest mb-1">{f.title}</div>
                        <div className="font-mono text-xs text-on-surface-variant leading-relaxed">{f.desc}</div>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default function HomePage() {
    const state = useHome()

    const isPublic = state.status === "PUBLIC_READY"
    const isReady = state.status === "READY"
    const hasData = isPublic || isReady

    return (
        <>
            {/* Sticky 페이지 헤더 - 탭바와 동일 높이 */}
            <div className="sticky top-0 z-40 bg-surface border-b border-outline">
                <div className="max-w-5xl mx-auto px-6 md:px-8 flex items-stretch justify-between">
                    <div className="flex flex-col px-5 py-3 font-mono text-xs uppercase">
                        <span className="font-bold tracking-widest text-on-surface">HOME</span>
                        <span className="text-[9px] text-on-surface-variant/60 normal-case mt-0.5">AI 기반 주식 분석 워크스테이션</span>
                    </div>
                    {isReady && (
                        <div className="flex items-center pr-2">
                            <Link
                                href="/my#watchlist"
                                className="flex items-center gap-1 border border-outline px-3 py-1.5 font-mono text-[10px] text-on-surface-variant hover:text-primary hover:border-primary uppercase"
                            >
                                <span className="material-symbols-outlined text-[12px]">person</span>
                                관심종목 설정
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            <main className="max-w-5xl mx-auto px-6 md:px-8 pt-4 pb-24 md:pb-8">
                {state.status === "LOADING" && <Skeleton />}

                {state.status === "UNAUTHENTICATED" && (
                    <div>
                        <div className="border border-dashed border-primary/40 bg-primary/5 px-5 py-6 text-center mb-4">
                            <div className="font-mono text-xs font-bold text-primary uppercase tracking-widest mb-2">
                                ALPHA_TERMINAL.AI
                            </div>
                            <p className="font-mono text-sm text-on-surface mb-1">
                                관심종목을 등록하고 AI가 분석해주는 맞춤 투자 인사이트를 받아보세요.
                            </p>
                            <p className="font-mono text-xs text-on-surface-variant mb-4">
                                센티먼트 게이지 · 알파 기회 종목 · 오늘의 AI 브리핑 · 투자 판단 분석
                            </p>
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-2 bg-primary text-white font-mono text-xs px-6 py-2.5 uppercase hover:opacity-90"
                            >
                                <span className="material-symbols-outlined text-[14px]">login</span>
                                카카오로 무료 시작하기 →
                            </Link>
                        </div>
                        <FeatureHighlights />
                    </div>
                )}

                {state.status === "EMPTY" && (
                    <div className="border border-dashed border-outline px-6 py-12 text-center">
                        <p className="font-mono text-sm text-on-surface-variant mb-1">
                            아직 AI 분석 데이터가 없습니다.
                        </p>
                        <p className="font-mono text-xs text-outline mb-4">
                            MY_PAGE에서 관심종목을 추가하고 DASHBOARD에서 분석을 실행해보세요.
                        </p>
                        <div className="flex justify-center gap-2">
                            <Link
                                href="/my"
                                className="font-mono text-[10px] bg-primary text-white px-4 py-1.5 uppercase hover:opacity-90"
                            >
                                관심종목 추가
                            </Link>
                            <Link
                                href="/dashboard"
                                className="font-mono text-[10px] border border-outline px-4 py-1.5 text-on-surface-variant hover:bg-surface-container uppercase"
                            >
                                DASHBOARD →
                            </Link>
                        </div>
                    </div>
                )}

                {state.status === "ERROR" && (
                    <div className="border border-dashed border-outline px-6 py-10 text-center">
                        <p className="font-mono text-sm text-error">[ERROR] {state.message}</p>
                    </div>
                )}

                {hasData && (
                    <div className="space-y-3">
                        {isPublic && (
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border border-outline-variant bg-surface-container px-4 py-3">
                                <div>
                                    <p className="font-mono text-xs font-bold text-on-surface uppercase tracking-widest mb-0.5">
                                        공개 관심종목 기준 미리보기
                                    </p>
                                    <p className="font-mono text-xs text-on-surface-variant">
                                        로그인하면 내 관심종목 기준 맞춤 분석으로 전환됩니다.
                                    </p>
                                </div>
                                <Link
                                    href="/login"
                                    className="shrink-0 inline-flex items-center gap-1.5 bg-primary text-white font-mono text-[10px] px-4 py-1.5 uppercase hover:opacity-90"
                                >
                                    <span className="material-symbols-outlined text-[12px]">login</span>
                                    카카오 로그인 →
                                </Link>
                            </div>
                        )}
                        <HomeSentimentGauge
                            gauge={state.stats.gauge}
                            distribution={state.stats.distribution}
                        />
                        <HomeAlphaTopPicks topPicks={state.stats.topPicks} />
                        {isReady && <HomeTodayBriefing briefing={state.briefing} />}
                        {isPublic && <FeatureHighlights />}
                    </div>
                )}
            </main>
        </>
    )
}

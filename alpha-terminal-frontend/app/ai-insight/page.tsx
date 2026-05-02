'use client'

import { useState } from 'react'
import { InvestPage } from '@/features/invest/ui/components/InvestPage'
import { StockRecommendationPrompt } from '@/features/stock-recommendation/ui/components/StockRecommendationPrompt'

type Tab = 'invest' | 'picks'

const TABS: { id: Tab; label: string; desc: string }[] = [
    { id: 'invest', label: '투자_판단', desc: '종목 매수·매도·보유 판단 · 멀티에이전트 심층분석' },
    { id: 'picks', label: '종목_추천', desc: '내 관심종목 기반 AI 맞춤 분석' },
]

export default function AiInsightPage() {
    const [activeTab, setActiveTab] = useState<Tab>('invest')

    const switchTab = (tab: Tab) => {
        setActiveTab(tab)
        window.scrollTo({ top: 0 })
    }

    return (
        <div>
            {/* 탭 헤더 */}
            <div className="sticky top-0 z-40 bg-surface border-b border-outline">
                <div className="max-w-5xl mx-auto px-6 md:px-8 flex">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => switchTab(tab.id)}
                            className={`relative flex flex-col px-5 py-3 font-mono text-xs uppercase transition-none ${
                                activeTab === tab.id
                                    ? 'text-primary font-bold'
                                    : 'text-on-surface-variant hover:text-on-surface'
                            }`}
                        >
                            <span className="font-bold tracking-widest">{tab.label}</span>
                            <span className="text-[9px] opacity-60 normal-case mt-0.5 hidden sm:block">{tab.desc}</span>
                            {activeTab === tab.id && (
                                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary" aria-hidden="true" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* 탭 컨텐츠 */}
            <div className={activeTab === 'invest' ? 'block' : 'hidden'}>
                <InvestPage />
            </div>
            <div className={activeTab === 'picks' ? 'block' : 'hidden'}>
                <StockRecommendationPrompt />
            </div>
        </div>
    )
}

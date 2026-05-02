'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAtomValue } from 'jotai'
import { authStateAtom } from '@/features/auth/application/atoms/authAtom'
import { NewsListPage } from '@/features/news/ui/components/NewsListPage'
import { YoutubeVideoFeed } from '@/features/youtube/ui/components/YoutubeVideoFeed'

type Tab = 'news' | 'videos'

const TABS: { id: Tab; label: string; desc: string }[] = [
    { id: 'news', label: '뉴스_피드', desc: '실시간 주요 금융 뉴스' },
    { id: 'videos', label: '영상_피드', desc: '유튜브 금융 채널 영상 모음' },
]

export default function MarketFeedPage() {
    const authState = useAtomValue(authStateAtom)
    const router = useRouter()
    const [activeTab, setActiveTab] = useState<Tab>('news')

    useEffect(() => {
        if (authState.status === 'PENDING_TERMS') {
            router.replace('/terms')
        }
    }, [authState.status, router])

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
            <div className={activeTab === 'news' ? 'block' : 'hidden'}>
                <NewsListPage />
            </div>
            <div className={activeTab === 'videos' ? 'block' : 'hidden'}>
                <YoutubeVideoFeed />
            </div>
        </div>
    )
}

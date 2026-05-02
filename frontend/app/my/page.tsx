'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAtomValue } from 'jotai'
import { authStateAtom } from '@/features/auth/application/atoms/authAtom'
import { useWatchlist } from '@/features/watchlist/application/hooks/useWatchlist'
import { MyWatchlistSection } from '@/features/my/ui/components/MyWatchlistSection'
import { MySettingsSection } from '@/features/my/ui/components/MySettingsSection'
import { MyProfileSection } from '@/features/my/ui/components/MyProfileSection'
import { MyInvestmentProfileSection } from '@/features/my/ui/components/MyInvestmentProfileSection'

const GUIDE_STEPS = [
    { step: '01', icon: 'visibility', text: '아래 MY_WATCHLIST에서 관심 종목을 추가하세요.' },
    { step: '02', icon: 'schedule',   text: 'SETTINGS → BRIEFING_TIME에서 브리핑 수신 시간을 설정하세요.' },
    { step: '03', icon: 'auto_stories', text: '설정한 시간이 되면 HOME에서 TODAY_BRIEFING을 확인할 수 있습니다.' },
]

function OnboardingGuide() {
    return (
        <div className="border border-dashed border-primary/50 bg-primary/5 px-5 py-4">
            <div className="font-mono text-xs font-bold text-primary uppercase tracking-widest mb-3">
                GETTING_STARTED
            </div>
            <div className="space-y-2.5">
                {GUIDE_STEPS.map(({ step, icon, text }) => (
                    <div key={step} className="flex items-start gap-3">
                        <span className="font-mono text-[10px] text-primary border border-primary/40 px-1.5 py-0.5 shrink-0 leading-tight">
                            {step}
                        </span>
                        <span className="material-symbols-outlined text-[15px] text-primary shrink-0 mt-0.5">{icon}</span>
                        <span className="font-mono text-xs text-on-surface-variant leading-relaxed">{text}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default function MyPage() {
    const authState = useAtomValue(authStateAtom)
    const router = useRouter()
    const { items: watchlistItems, isLoading: isWatchlistLoading } = useWatchlist()
    const isNewUser = !isWatchlistLoading && watchlistItems.length === 0

    useEffect(() => {
        if (authState.status === 'UNAUTHENTICATED') {
            router.replace('/login')
        }
        if (authState.status === 'PENDING_TERMS') {
            router.replace('/terms')
        }
    }, [authState.status, router])

    if (authState.status === 'LOADING') {
        return (
            <main className="max-w-5xl mx-auto p-6 pt-8 pb-24 md:p-8 md:pb-8">
                <div className="space-y-3">
                    <div className="h-24 bg-surface-container animate-pulse" />
                    <div className="h-48 bg-surface-container animate-pulse" />
                    <div className="h-36 bg-surface-container animate-pulse" />
                </div>
            </main>
        )
    }

    if (authState.status !== 'AUTHENTICATED') return null

    return (
        <>
            {/* Sticky 페이지 헤더 */}
            <div className="sticky top-0 z-40 bg-surface border-b border-outline">
                <div className="max-w-5xl mx-auto px-6 md:px-8 flex">
                    <div className="flex flex-col px-5 py-3 font-mono text-xs uppercase">
                        <span className="font-bold tracking-widest text-on-surface">MY_PAGE</span>
                        <span className="text-[9px] text-on-surface-variant/60 normal-case mt-0.5">관심종목 · 설정</span>
                    </div>
                </div>
            </div>

            <main className="max-w-5xl mx-auto px-6 md:px-8 pt-4 pb-24 md:pb-8">
                <div className="space-y-4">
                    {isNewUser && <OnboardingGuide />}
                    <MyWatchlistSection />
                    <MySettingsSection />
                    <MyInvestmentProfileSection />
                    <MyProfileSection />
                </div>
            </main>
        </>
    )
}

'use client'

import { useAtomValue } from 'jotai'
import { useHome } from '@/features/home/application/hooks/useHome'
import { HomeTodayBriefing } from '@/app/components/HomeTodayBriefing'
import { notificationAtom } from '@/features/notification/application/atoms/notificationAtom'

function toKSTDateString(isoString: string): string {
    const d = new Date(new Date(isoString).getTime() + 9 * 60 * 60 * 1000)
    return d.toISOString().slice(0, 10)
}

export function MyBriefingSection() {
    const state = useHome()
    const { notifications } = useAtomValue(notificationAtom)

    const today = toKSTDateString(new Date().toISOString())
    const todayBriefingNotif = notifications.find(
        (n) =>
            n.title.startsWith('[오늘의 관심종목 브리핑]') &&
            toKSTDateString(n.createdAt) === today,
    ) ?? null

    const hasPipelineData =
        (state.status === 'READY' || state.status === 'PUBLIC_READY') &&
        !state.briefing.isEmpty

    const showEmpty =
        state.status === 'EMPTY' ||
        ((state.status === 'READY' || state.status === 'PUBLIC_READY') && state.briefing.isEmpty)

    return (
        <section>
            <div className="mb-3 font-mono text-xs font-bold text-on-surface uppercase tracking-widest">
                TODAY_BRIEFING
            </div>

            {state.status === 'LOADING' && (
                <div className="h-32 bg-surface-container animate-pulse" />
            )}

            {hasPipelineData && (
                <HomeTodayBriefing briefing={state.briefing} />
            )}

            {showEmpty && (
                todayBriefingNotif ? (
                    <div className="border border-outline bg-surface-container-low px-5 py-4">
                        <div className="mb-3 flex items-center justify-between">
                            <span className="font-mono text-xs font-bold text-on-surface uppercase tracking-widest">
                                TODAY_BRIEFING
                            </span>
                            <span className="font-mono text-xs text-outline">
                                {new Date(todayBriefingNotif.createdAt).toLocaleDateString('ko-KR', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    timeZone: 'Asia/Seoul',
                                })}
                            </span>
                        </div>
                        <p className="font-mono text-sm text-on-surface leading-relaxed whitespace-pre-wrap">
                            {todayBriefingNotif.body}
                        </p>
                        <p className="mt-3 font-mono text-xs text-outline">
                            * 투자 권유 아님. AI 분석 참고용 정보입니다.
                        </p>
                    </div>
                ) : (
                    <div className="border border-dashed border-outline px-5 py-8 text-center">
                        <p className="font-mono text-sm text-on-surface-variant mb-1">
                            아직 오늘의 브리핑이 없습니다.
                        </p>
                        <p className="font-mono text-xs text-outline">
                            매일 07:00 KST 자동으로 수집됩니다.
                        </p>
                    </div>
                )
            )}

            {state.status === 'ERROR' && (
                <div className="border border-dashed border-outline px-5 py-6 text-center">
                    <p className="font-mono text-sm text-error">[ERROR] {state.message}</p>
                </div>
            )}
        </section>
    )
}

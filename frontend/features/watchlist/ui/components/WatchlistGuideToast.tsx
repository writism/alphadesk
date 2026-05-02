"use client"

import { useEffect } from "react"
import Link from "next/link"

interface Props {
    onDismiss: () => void
}

export default function WatchlistGuideToast({ onDismiss }: Props) {
    useEffect(() => {
        return () => {
            onDismiss()
        }
    }, [onDismiss])

    return (
        <div
            role="alert"
            aria-live="polite"
            className="fixed bottom-6 right-6 z-[90] flex max-w-xs flex-col gap-3 border border-outline bg-surface-container-low px-4 py-3 shadow-xl"
        >
            <div className="flex items-start gap-3">
                <span className="material-symbols-outlined mt-0.5 shrink-0 text-[16px] text-primary">bookmark_add</span>
                <p className="font-mono text-xs text-on-surface leading-relaxed">
                    관심종목을 설정하면 AI 분석 기능을 사용하실 수 있습니다.
                </p>
            </div>
            <div className="flex justify-end gap-2">
                <Link
                    href="/my#watchlist"
                    className="font-mono text-[10px] bg-primary text-white px-3 py-1.5 uppercase hover:opacity-90"
                    onClick={onDismiss}
                >
                    설정하러 가기
                </Link>
                <button
                    type="button"
                    onClick={onDismiss}
                    className="font-mono text-[10px] border border-outline px-3 py-1.5 text-on-surface-variant hover:text-primary uppercase"
                >
                    확인
                </button>
            </div>
        </div>
    )
}

"use client"

import { useEffect } from "react"

interface Props {
    message: string
    onDismiss: () => void
    durationMs?: number
}

export default function NotificationToast({ message, onDismiss, durationMs = 4000 }: Props) {
    useEffect(() => {
        const timer = setTimeout(onDismiss, durationMs)
        return () => clearTimeout(timer)
    }, [onDismiss, durationMs])

    return (
        <div
            role="alert"
            aria-live="polite"
            className="fixed bottom-6 right-6 z-[90] flex max-w-xs items-start gap-3 rounded-md border border-gray-700 bg-gray-800 px-4 py-3 shadow-xl"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mt-0.5 h-4 w-4 shrink-0 text-yellow-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
            </svg>
            <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-yellow-300">새 알림</p>
                <p className="mt-0.5 text-sm text-gray-100">{message}</p>
            </div>
            <button
                type="button"
                onClick={onDismiss}
                aria-label="알림 닫기"
                className="ml-auto shrink-0 text-gray-500 hover:text-gray-200 transition-colors"
            >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    )
}

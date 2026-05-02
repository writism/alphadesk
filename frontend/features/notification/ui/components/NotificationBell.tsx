"use client"

import { useRef, useState, useEffect } from "react"
import { useNotification } from "@/features/notification/application/hooks/useNotification"
import NotificationInbox from "./NotificationInbox"
import NotificationToast from "./NotificationToast"

export default function NotificationBell() {
    const [open, setOpen] = useState(false)
    const bellRef = useRef<HTMLDivElement>(null)
    const {
        notifications,
        unreadCount,
        isLoading,
        markAsRead,
        markAllAsRead,
        toastMessage,
        dismissToast,
    } = useNotification()

    // 외부 클릭 시 닫기
    useEffect(() => {
        if (!open) return
        function handleClick(e: MouseEvent) {
            if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClick)
        return () => document.removeEventListener("mousedown", handleClick)
    }, [open])

    // Escape 키로 닫기
    useEffect(() => {
        if (!open) return
        function handleKey(e: KeyboardEvent) {
            if (e.key === "Escape") setOpen(false)
        }
        window.addEventListener("keydown", handleKey)
        return () => window.removeEventListener("keydown", handleKey)
    }, [open])

    return (
        <>
            <div ref={bellRef} className="relative">
                <button
                    type="button"
                    aria-label={`알림 ${unreadCount > 0 ? `(읽지 않은 알림 ${unreadCount}개)` : ""}`}
                    aria-expanded={open}
                    onClick={() => setOpen((o) => !o)}
                    className="relative inline-flex h-6 w-6 shrink-0 items-center justify-center text-inverse-on-surface opacity-70 hover:opacity-100 hover:text-white transition-none focus:outline-none"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.8}
                        aria-hidden
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                        />
                    </svg>

                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-red-500 px-0.5 text-[8px] font-bold text-white">
                            {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                    )}
                </button>

                {open && (
                    <NotificationInbox
                        notifications={notifications}
                        isLoading={isLoading}
                        onMarkAsRead={markAsRead}
                        onMarkAllAsRead={markAllAsRead}
                        onClose={() => setOpen(false)}
                    />
                )}
            </div>

            {toastMessage && (
                <NotificationToast message={toastMessage} onDismiss={dismissToast} />
            )}
        </>
    )
}

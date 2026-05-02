"use client"

import type { Notification } from "@/features/notification/domain/model/notification"

interface Props {
    notifications: Notification[]
    isLoading: boolean
    onMarkAsRead: (id: string, link?: string) => void
    onMarkAllAsRead: () => void
    onClose: () => void
}

function timeAgo(createdAt: string): string {
    const diff = Date.now() - new Date(createdAt).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return "방금 전"
    if (mins < 60) return `${mins}분 전`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}시간 전`
    const days = Math.floor(hours / 24)
    return `${days}일 전`
}

const typeColors: Record<NonNullable<Notification["type"]>, string> = {
    info: "bg-blue-500",
    warning: "bg-yellow-500",
    success: "bg-green-500",
    error: "bg-red-500",
}

export default function NotificationInbox({
    notifications,
    isLoading,
    onMarkAsRead,
    onMarkAllAsRead,
    onClose,
}: Props) {
    const sorted = [...notifications].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    return (
        <div
            role="dialog"
            aria-label="알림 목록"
            className="absolute right-0 top-full z-[80] mt-2 w-80 rounded-md border border-gray-700 bg-gray-900 shadow-xl"
        >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-700 px-4 py-3">
                <span className="text-sm font-semibold text-gray-100">알림</span>
                <button
                    type="button"
                    onClick={() => {
                        onMarkAllAsRead()
                        onClose()
                    }}
                    className="text-xs text-gray-400 hover:text-yellow-300 transition-colors"
                >
                    모두 읽음
                </button>
            </div>

            {/* Body */}
            <ul className="max-h-80 overflow-y-auto">
                {isLoading && (
                    <li className="px-4 py-6 text-center text-sm text-gray-500">불러오는 중...</li>
                )}

                {!isLoading && sorted.length === 0 && (
                    <li className="px-4 py-6 text-center text-sm text-gray-500">
                        새 알림이 없습니다.
                    </li>
                )}

                {!isLoading &&
                    sorted.map((n) => {
                        const effectiveLink = n.link ?? (n.title.startsWith("[오늘의 관심종목 브리핑]") ? "/" : undefined)
                        return (
                        <li key={n.id}>
                            <button
                                type="button"
                                onClick={() => onMarkAsRead(n.id, effectiveLink)}
                                className={`w-full text-left px-4 py-3 border-b border-gray-800 hover:bg-gray-800 transition-colors ${
                                    n.isRead ? "opacity-50" : ""
                                }`}
                            >
                                <div className="flex items-start gap-2">
                                    <span
                                        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.type ? typeColors[n.type] : "bg-gray-500"}`}
                                        aria-hidden
                                    />
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium text-gray-100">
                                            {n.title}
                                        </p>
                                        <p className="mt-0.5 text-xs text-gray-400 line-clamp-2">
                                            {n.body}
                                        </p>
                                        <p className="mt-1 text-[10px] text-gray-600">
                                            {timeAgo(n.createdAt)}
                                        </p>
                                    </div>
                                    {!n.isRead && (
                                        <span className="ml-auto mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-400" aria-hidden />
                                    )}
                                </div>
                            </button>
                        </li>
                    )})}

            </ul>
        </div>
    )
}

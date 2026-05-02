"use client"

import { useAtom } from "jotai"
import { useCallback, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import {
    notificationAtom,
    toastNotificationAtom,
} from "@/features/notification/application/atoms/notificationAtom"
import {
    getNotifications,
    markAsRead,
    markAllAsRead,
} from "@/features/notification/infrastructure/api/notificationApi"

export function useNotification() {
    const [state, setState] = useAtom(notificationAtom)
    const [toastMessage, setToastMessage] = useAtom(toastNotificationAtom)
    const prevUnreadRef = useRef<number | null>(null)
    const router = useRouter()

    const loadNotifications = useCallback(async () => {
        setState((s) => ({ ...s, isLoading: true, error: null }))
        try {
            const notifications = await getNotifications()
            const unreadCount = notifications.filter((n) => !n.isRead).length

            // 새 알림 도착 시 토스트 표시
            if (prevUnreadRef.current !== null && unreadCount > prevUnreadRef.current) {
                const newest = notifications.find((n) => !n.isRead)
                if (newest) setToastMessage(newest.title)
            }
            prevUnreadRef.current = unreadCount

            setState({ notifications, unreadCount, isLoading: false, error: null })
        } catch {
            setState((s) => ({ ...s, isLoading: false, error: "알림을 불러오지 못했습니다." }))
        }
    }, [setState, setToastMessage])

    const handleMarkAsRead = useCallback(
        async (id: string, link?: string) => {
            setState((s) => ({
                ...s,
                notifications: s.notifications.map((n) =>
                    n.id === id ? { ...n, isRead: true } : n
                ),
                unreadCount: Math.max(0, s.unreadCount - 1),
            }))
            try {
                await markAsRead(id)
            } catch {
                // 낙관적 업데이트 실패 시 재로드
                await loadNotifications()
            }
            if (link) router.push(link)
        },
        [setState, loadNotifications, router]
    )

    const handleMarkAllAsRead = useCallback(async () => {
        setState((s) => ({
            ...s,
            notifications: s.notifications.map((n) => ({ ...n, isRead: true })),
            unreadCount: 0,
        }))
        try {
            await markAllAsRead()
        } catch {
            await loadNotifications()
        }
    }, [setState, loadNotifications])

    const dismissToast = useCallback(() => setToastMessage(null), [setToastMessage])

    useEffect(() => {
        loadNotifications()
    }, [loadNotifications])

    return {
        notifications: state.notifications,
        unreadCount: state.unreadCount,
        isLoading: state.isLoading,
        error: state.error,
        toastMessage,
        markAsRead: handleMarkAsRead,
        markAllAsRead: handleMarkAllAsRead,
        dismissToast,
        reload: loadNotifications,
    }
}

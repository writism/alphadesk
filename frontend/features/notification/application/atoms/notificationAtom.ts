import { atom } from "jotai"
import type { NotificationListState } from "@/features/notification/domain/model/notification"

export const notificationAtom = atom<NotificationListState>({
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    error: null,
})

export const toastNotificationAtom = atom<string | null>(null)

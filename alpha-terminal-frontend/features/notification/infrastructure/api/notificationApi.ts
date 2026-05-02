import { httpClient } from "@/infrastructure/http/httpClient"
import type { Notification } from "@/features/notification/domain/model/notification"

type BackendNotification = {
    id: string | number
    title: string
    body: string
    type?: Notification["type"]
    link?: string
    is_read: boolean
    created_at: string
}

function mapNotification(raw: BackendNotification): Notification {
    return {
        id: String(raw.id),
        title: raw.title,
        body: raw.body,
        type: raw.type,
        link: raw.link,
        isRead: raw.is_read,
        createdAt: raw.created_at,
    }
}

export async function getNotifications(): Promise<Notification[]> {
    const res = await httpClient.get("/notifications")
    const data: BackendNotification[] = await res.json()
    return data.map(mapNotification)
}

export async function getUnreadCount(): Promise<number> {
    const res = await httpClient.get("/notifications/unread-count")
    const data = await res.json()
    return data.count
}

export async function markAsRead(id: string): Promise<void> {
    await httpClient.patch(`/notifications/${id}/read`)
}

export async function markAllAsRead(): Promise<void> {
    await httpClient.patch("/notifications/read-all")
}

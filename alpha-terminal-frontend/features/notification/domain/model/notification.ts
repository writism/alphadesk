export interface Notification {
    id: string
    title: string
    body: string
    type?: "info" | "warning" | "success" | "error"
    link?: string
    isRead: boolean
    createdAt: string
}

export interface NotificationListState {
    notifications: Notification[]
    unreadCount: number
    isLoading: boolean
    error: string | null
}

export interface RetentionPoint {
    day: number
    rate: number
}

export interface AdminStats {
    total_users: number
    new_users_today: number
    new_users_this_week: number
    retention: RetentionPoint[]
    avg_dwell_time_seconds: number | null
    ctr: number | null
}

export interface AdminUserItem {
    id: number
    nickname: string
    email: string
    role: "NORMAL" | "ADMIN"
    created_at: string
}

export interface AdminUsersResponse {
    users: AdminUserItem[]
    total: number
}

export interface AdminLogItem {
    id: number
    symbol: string
    name: string
    analyzed_at: string
    sentiment: string
    sentiment_score: number
    source_type: string | null
    account_id: number | null
}

export interface AdminLogsResponse {
    logs: AdminLogItem[]
    total: number
}

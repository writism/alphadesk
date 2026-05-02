import { httpClient } from "@/infrastructure/http/httpClient"
import type { AdminStats, AdminUsersResponse, AdminUserItem, AdminLogsResponse } from "../../domain/model/adminStats"

export const adminApi = {
    getStats: async (): Promise<AdminStats> => {
        const res = await httpClient.get("/admin/dashboard/stats")
        return res.json()
    },

    getUsers: async (page = 1, size = 20): Promise<AdminUsersResponse> => {
        const res = await httpClient.get(`/admin/users?page=${page}&size=${size}`)
        return res.json()
    },

    updateUserRole: async (userId: number, role: "NORMAL" | "ADMIN"): Promise<AdminUserItem> => {
        const res = await httpClient.patch(`/admin/users/${userId}/role`, { role })
        return res.json()
    },

    getLogs: async (limit = 50): Promise<AdminLogsResponse> => {
        const res = await httpClient.get(`/admin/logs?limit=${limit}`)
        return res.json()
    },
}

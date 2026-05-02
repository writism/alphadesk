"use client"

import { useCallback, useEffect, useState } from "react"
import { adminApi } from "../../infrastructure/api/adminApi"
import type { AdminUserItem } from "../../domain/model/adminStats"

export function useAdminUsers() {
    const [users, setUsers] = useState<AdminUserItem[]>([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [isLoading, setIsLoading] = useState(true)

    const fetch = useCallback(async (p: number) => {
        setIsLoading(true)
        try {
            const data = await adminApi.getUsers(p)
            setUsers(data.users)
            setTotal(data.total)
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => { fetch(page) }, [fetch, page])

    const updateRole = useCallback(async (userId: number, role: "NORMAL" | "ADMIN") => {
        const updated = await adminApi.updateUserRole(userId, role)
        setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
    }, [])

    return { users, total, page, setPage, isLoading, updateRole }
}

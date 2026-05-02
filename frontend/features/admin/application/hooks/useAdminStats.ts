"use client"

import { useEffect, useState } from "react"
import { adminApi } from "../../infrastructure/api/adminApi"
import type { AdminStats } from "../../domain/model/adminStats"

type Status = "loading" | "forbidden" | "error" | "ok"

export function useAdminStats() {
    const [stats, setStats] = useState<AdminStats | null>(null)
    const [status, setStatus] = useState<Status>("loading")

    useEffect(() => {
        adminApi
            .getStats()
            .then((data) => {
                setStats(data)
                setStatus("ok")
            })
            .catch((err: unknown) => {
                const code = (err as { status?: number }).status
                setStatus(code === 403 ? "forbidden" : "error")
            })
    }, [])

    return { stats, status }
}

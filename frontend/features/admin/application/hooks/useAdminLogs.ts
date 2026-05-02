"use client"

import { useEffect, useState } from "react"
import { adminApi } from "../../infrastructure/api/adminApi"
import type { AdminLogItem } from "../../domain/model/adminStats"

export function useAdminLogs(limit = 50) {
    const [logs, setLogs] = useState<AdminLogItem[]>([])
    const [total, setTotal] = useState(0)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        adminApi.getLogs(limit).then((data) => {
            setLogs(data.logs)
            setTotal(data.total)
        }).finally(() => setIsLoading(false))
    }, [limit])

    return { logs, total, isLoading }
}

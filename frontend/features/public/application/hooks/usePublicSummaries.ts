"use client"

import { useEffect, useState } from "react"
import { fetchPublicSummaries } from "../../infrastructure/api/publicApi"
import type { PublicSummary } from "../../domain/model/publicSummary"

export function usePublicSummaries() {
    const [summaries, setSummaries] = useState<PublicSummary[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchPublicSummaries()
            .then(setSummaries)
            .finally(() => setIsLoading(false))
    }, [])

    return { summaries, isLoading }
}

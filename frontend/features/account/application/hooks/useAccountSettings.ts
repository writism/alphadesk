"use client"

import { useEffect, useState } from "react"
import { fetchAccountSettings, updateAccountSettings } from "../../infrastructure/api/accountSettingsApi"

export function useAccountSettings() {
    const [isWatchlistPublic, setIsWatchlistPublic] = useState(true)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        fetchAccountSettings()
            .then((s) => setIsWatchlistPublic(s.is_watchlist_public))
            .catch(() => {})
            .finally(() => setIsLoading(false))
    }, [])

    const toggle = async (value: boolean) => {
        setIsSaving(true)
        try {
            const updated = await updateAccountSettings({ is_watchlist_public: value })
            setIsWatchlistPublic(updated.is_watchlist_public)
        } finally {
            setIsSaving(false)
        }
    }

    return { isWatchlistPublic, isLoading, isSaving, toggle }
}

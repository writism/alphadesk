"use client"

import { useEffect, useState } from "react"
import { useAtomValue } from "jotai"
import { isLoggedInAtom } from "@/features/auth/application/selectors/authSelectors"
import { adminApi } from "../../infrastructure/api/adminApi"

export function useIsAdmin(): boolean | null {
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
    const isLoggedIn = useAtomValue(isLoggedInAtom)

    useEffect(() => {
        if (!isLoggedIn) {
            setIsAdmin(false)
            return
        }
        adminApi
            .getStats()
            .then(() => setIsAdmin(true))
            .catch((err: unknown) => {
                const code = (err as { status?: number }).status
                setIsAdmin(code === 403 ? false : null)
            })
    }, [isLoggedIn])

    return isAdmin
}

'use client'

import { useState, useEffect, useRef } from 'react'
import { useAtomValue } from 'jotai'
import { authStateAtom } from '@/features/auth/application/atoms/authAtom'
import { getInvestmentProfile, saveInvestmentProfile, type InvestmentProfile } from '@/features/my/infrastructure/api/myApi'

const EMPTY: InvestmentProfile = {
    investment_style: '',
    risk_tolerance: '',
    preferred_sectors: [],
    analysis_preference: '',
    keywords_of_interest: [],
}

export function useInvestmentProfile() {
    const authState = useAtomValue(authStateAtom)
    const userId = authState.status === 'AUTHENTICATED' ? Number(authState.user?.accountId) : null

    const [profile, setProfile] = useState<InvestmentProfile>(EMPTY)
    const [saving, setSaving] = useState(false)
    const [saveMessage, setSaveMessage] = useState<string | null>(null)
    const saveMessageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        if (!userId) return
        getInvestmentProfile(userId).then(setProfile).catch(() => {})
    }, [userId])

    useEffect(() => {
        return () => {
            if (saveMessageTimerRef.current) clearTimeout(saveMessageTimerRef.current)
        }
    }, [])

    const save = async (next: InvestmentProfile) => {
        if (!userId) return
        setSaving(true)
        setSaveMessage(null)
        try {
            const saved = await saveInvestmentProfile(userId, next)
            setProfile(saved)
            if (saveMessageTimerRef.current) clearTimeout(saveMessageTimerRef.current)
            setSaveMessage('저장되었습니다.')
            saveMessageTimerRef.current = setTimeout(() => setSaveMessage(null), 2000)
        } catch {
            setSaveMessage('저장에 실패했습니다.')
        } finally {
            setSaving(false)
        }
    }

    return { profile, saving, saveMessage, save }
}

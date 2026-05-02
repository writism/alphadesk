'use client'

import { useState, useEffect, useRef } from 'react'
import { useAtom, useAtomValue } from 'jotai'
import { articleModeAtom, type ArticleMode } from '@/features/dashboard/application/atoms/pipelineAtom'
import {
    getBriefingSettingsLocal,
    saveBriefingSettingsLocal,
    getArticleModeLocal,
    saveArticleModeLocal,
    getBriefingTime,
    saveBriefingTime,
} from '@/features/my/infrastructure/api/myApi'
import type { BriefingTimeSettings } from '@/features/my/domain/model/mySettings'
import { BRIEFING_DEFAULTS } from '@/features/my/domain/model/mySettings'
import { authStateAtom } from '@/features/auth/application/atoms/authAtom'

export function useMySettings() {
    const authState = useAtomValue(authStateAtom)
    const userId = authState.status === 'AUTHENTICATED' ? Number(authState.user?.accountId) : null

    const [articleMode, setArticleMode] = useAtom(articleModeAtom)
    const [briefingSettings, setBriefingSettings] = useState<BriefingTimeSettings>(BRIEFING_DEFAULTS)
    const [saveMessage, setSaveMessage] = useState<string | null>(null)
    const saveMessageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        const local = getBriefingSettingsLocal()
        setBriefingSettings(local)
        setArticleMode(getArticleModeLocal())
    }, [setArticleMode])

    useEffect(() => {
        if (!userId) return
        getBriefingTime(userId)
            .then((hour) => {
                setBriefingSettings((prev) => ({ ...prev, korea_time: hour }))
            })
            .catch(() => {})
    }, [userId])

    useEffect(() => {
        return () => {
            if (saveMessageTimerRef.current) clearTimeout(saveMessageTimerRef.current)
        }
    }, [])

    const saveBriefingSettings = async (settings: BriefingTimeSettings) => {
        saveBriefingSettingsLocal(settings)
        setBriefingSettings(settings)
        if (userId) {
            try {
                await saveBriefingTime(userId, settings.korea_time)
            } catch {
                // localStorage 저장은 성공했으므로 UI 에러는 표시하지 않음
            }
        }
        if (saveMessageTimerRef.current) clearTimeout(saveMessageTimerRef.current)
        setSaveMessage('저장되었습니다.')
        saveMessageTimerRef.current = setTimeout(() => setSaveMessage(null), 2000)
    }

    const updateArticleMode = (mode: ArticleMode) => {
        saveArticleModeLocal(mode)
        setArticleMode(mode)
    }

    return { articleMode, updateArticleMode, briefingSettings, saveBriefingSettings, saveMessage }
}

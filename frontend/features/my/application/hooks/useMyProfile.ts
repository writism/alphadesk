'use client'

import { useState, useEffect } from 'react'
import { useAtomValue } from 'jotai'
import { authStateAtom } from '@/features/auth/application/atoms/authAtom'
import { updateUserEmail } from '@/features/my/infrastructure/api/myApi'

type SaveMessage = { type: 'success' | 'error'; text: string }

export function useMyProfile() {
    const authState = useAtomValue(authStateAtom)
    const user = authState.status === 'AUTHENTICATED' ? authState.user : null

    const [email, setEmail] = useState('')
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState<SaveMessage | null>(null)

    useEffect(() => {
        if (user?.email) setEmail(user.email)
    }, [user?.email])

    const saveEmail = async () => {
        if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setMessage({ type: 'error', text: '올바른 이메일 형식이 아닙니다.' })
            return
        }
        setSaving(true)
        setMessage(null)
        try {
            await updateUserEmail(email)
            setMessage({ type: 'success', text: '이메일이 저장되었습니다.' })
        } catch {
            setMessage({ type: 'error', text: '저장에 실패했습니다.' })
        } finally {
            setSaving(false)
        }
    }

    return { user, email, setEmail, saving, message, saveEmail }
}

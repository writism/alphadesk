'use client'

import { useState, useEffect } from 'react'
import type { LandingPage } from '@/features/my/domain/model/landingPage'
import { DEFAULT_LANDING_PAGE } from '@/features/my/domain/model/landingPage'
import { getLandingPageLocal, saveLandingPageLocal } from '@/features/my/infrastructure/api/landingPageStorage'

export function useLandingPage() {
    const [landingPage, setLandingPage] = useState<LandingPage>(DEFAULT_LANDING_PAGE)

    useEffect(() => {
        setLandingPage(getLandingPageLocal())
    }, [])

    const updateLandingPage = (page: LandingPage) => {
        saveLandingPageLocal(page)
        setLandingPage(page)
    }

    return { landingPage, updateLandingPage }
}

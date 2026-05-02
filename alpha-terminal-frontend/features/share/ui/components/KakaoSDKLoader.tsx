"use client"

import { useEffect } from "react"
import { env } from "@/infrastructure/config/env"

declare global {
    interface Window {
        Kakao?: {
            init: (key: string) => void
            isInitialized: () => boolean
            Share: {
                sendDefault: (options: Record<string, unknown>) => void
            }
            Story: {
                share: (options: { url: string; text: string }) => void
            }
        }
    }
}

export function KakaoSDKLoader() {
    useEffect(() => {
        if (!env.kakaoJsKey) return
        if (window.Kakao?.isInitialized()) return

        const script = document.createElement("script")
        script.src = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js"
        script.async = true
        script.onload = () => {
            if (window.Kakao && !window.Kakao.isInitialized()) {
                window.Kakao.init(env.kakaoJsKey)
            }
        }
        document.head.appendChild(script)
    }, [])

    return null
}

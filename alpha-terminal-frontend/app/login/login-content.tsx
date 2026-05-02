"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/features/auth/application/hooks/useAuth"
import { KakaoLoginButton } from "@/features/auth/ui/components/LoginButton"

const oauthButtons = [
    <KakaoLoginButton key="kakao" />,
    // 추가 OAuth 버튼은 여기에
]

export function LoginContent() {
    const { state } = useAuth()
    const router = useRouter()
    const searchParams = useSearchParams()
    const reason = searchParams.get("reason")
    const expiredSignupSession = reason === "signup-session-expired"

    useEffect(() => {
        if (state.status === "AUTHENTICATED") {
            router.push("/")
        }
    }, [state.status, router])

    if (state.status === "LOADING") {
        return (
            <div className="flex justify-center items-center h-full">
                <span className="font-mono text-[11px] text-on-surface-variant uppercase tracking-widest animate-pulse">
                    AUTH_VERIFY...
                </span>
            </div>
        )
    }

    if (state.status === "AUTHENTICATED") {
        return null
    }

    return (
        <div className="flex flex-col justify-center items-center h-full gap-6">
            <div className="w-full max-w-sm border border-outline bg-surface-container-low p-8">
                <div className="mb-6 border-b border-outline pb-4">
                    <div className="font-mono font-bold text-primary text-base uppercase tracking-tighter">
                        SYS_LOGIN
                    </div>
                    <div className="font-mono text-[10px] text-on-surface-variant tracking-widest mt-0.5">
                        ALPHA_TERMINAL / AUTH_MODULE
                    </div>
                </div>

                {expiredSignupSession && (
                    <div className="mb-4 border border-outline px-3 py-2 font-mono text-[11px] text-error bg-error-container/20">
                        [WARN] 회원가입 세션이 만료되었습니다. 카카오 로그인을 다시 진행해 주세요.
                    </div>
                )}

                <div className="flex flex-col gap-3">
                    {oauthButtons}
                </div>

                <p className="mt-6 font-mono text-[9px] text-outline tracking-widest text-center">
                    AI 분석 참고용 · 투자 추천 아님
                </p>
            </div>
        </div>
    )
}

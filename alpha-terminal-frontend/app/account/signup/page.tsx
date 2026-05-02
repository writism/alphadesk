"use client"

import { Suspense, useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAtom } from "jotai"
import { useSignup } from "@/features/auth/application/hooks/useSignup"
import { useTerms } from "@/features/terms/application/hooks/useTerms"
import { termsConsentAtom } from "@/features/terms/application/atoms/termsConsentAtom"

export default function AccountSignupPage() {
    return (
        <Suspense>
            <AccountSignupContent />
        </Suspense>
    )
}

function AccountSignupContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { terms } = useTerms()
    const [termsConsent] = useAtom(termsConsentAtom)
    const [nickname, setNickname] = useState("")
    const [email, setEmail] = useState("")
    const { register, error, isLoading } = useSignup()

    const requiredTermIds = terms.filter(t => t.required).map(t => t.id)
    const hasRequiredConsent = requiredTermIds.every(id => termsConsent.includes(id))

    const profileNickname = searchParams.get("nickname")
    const profileEmail = searchParams.get("email")
    const hasNicknameProfile = Boolean(profileNickname)
    const isEmailReadonly = Boolean(profileEmail)

    useEffect(() => {
        if (!hasNicknameProfile || !hasRequiredConsent) {
            const params = searchParams.toString()
            router.replace(`/terms${params ? `?${params}` : ""}`)
        }
    }, [hasNicknameProfile, hasRequiredConsent, router, searchParams])

    useEffect(() => {
        setNickname(profileNickname ?? "")
        setEmail(profileEmail ?? "")
    }, [profileNickname, profileEmail])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        await register(nickname, email)
    }

    if (!hasNicknameProfile || !hasRequiredConsent) return null

    return (
        <div className="flex flex-col justify-center items-center h-screen">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-80">
                <h1 className="text-2xl font-bold">회원가입</h1>
                <div className="flex flex-col gap-1">
                    <label className="text-sm text-gray-600">닉네임</label>
                    <input
                        type="text"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        className="border rounded px-3 py-2"
                        required
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label className="text-sm text-gray-600">이메일</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        readOnly={isEmailReadonly}
                        className={`border rounded px-3 py-2 ${
                            isEmailReadonly
                                ? "bg-gray-50 text-gray-500 cursor-not-allowed"
                                : ""
                        }`}
                        required
                    />
                    {!isEmailReadonly && (
                        <p className="text-xs text-gray-500">
                            카카오 계정에서 이메일 정보를 가져오지 못해 직접 입력이 필요합니다.
                        </p>
                    )}
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button
                    type="submit"
                    disabled={isLoading || !nickname.trim() || !email.trim()}
                    className="bg-yellow-300 text-black font-semibold py-2 rounded hover:bg-yellow-400 disabled:opacity-50"
                >
                    {isLoading ? "가입 중..." : "가입하기"}
                </button>
            </form>
        </div>
    )
}

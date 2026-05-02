"use client"

import { Suspense, useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useSignup } from "@/features/auth/application/hooks/useSignup"

export default function SignupPage() {
    return (
        <Suspense>
            <SignupContent />
        </Suspense>
    )
}

function SignupContent() {
    const searchParams = useSearchParams()
    const [nickname, setNickname] = useState("")
    const [email, setEmail] = useState("")
    const { register, error, isLoading } = useSignup()

    useEffect(() => {
        setNickname(searchParams.get("nickname") ?? "")
        setEmail(searchParams.get("email") ?? "")
    }, [searchParams])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        await register(nickname, email)
    }

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
                        className="border rounded px-3 py-2"
                        required
                    />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-yellow-300 text-black font-semibold py-2 rounded hover:bg-yellow-400 disabled:opacity-50"
                >
                    {isLoading ? "가입 중..." : "가입하기"}
                </button>
            </form>
        </div>
    )
}

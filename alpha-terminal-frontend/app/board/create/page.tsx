"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAtomValue } from "jotai"
import { authStateAtom } from "@/features/auth/application/atoms/authAtom"
import { useBoardCreate } from "@/features/board/application/hooks/useBoardCreate"

export default function BoardCreatePage() {
    const router = useRouter()
    const authState = useAtomValue(authStateAtom)
    const { form, setField, isSubmitting, error, submit } = useBoardCreate()

    // 비인증 사용자 → 로그인 페이지로 리다이렉트
    useEffect(() => {
        if (authState.status === "UNAUTHENTICATED") {
            router.replace("/login")
        }
        if (authState.status === "PENDING_TERMS") {
            router.replace("/terms")
        }
    }, [authState.status, router])

    if (authState.status !== "AUTHENTICATED") {
        return null
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const boardId = await submit()
        if (boardId !== null) router.push(`/board/read/${boardId}`)
    }

    return (
        <main className="min-h-screen bg-background text-foreground p-6 md:p-10">
            <header className="mb-8 flex items-center gap-3">
                <Link
                    href="/board"
                    className="text-sm text-gray-500 transition-colors hover:text-gray-700 dark:hover:text-gray-300"
                    aria-label="게시판으로 돌아가기"
                >
                    ← 게시판
                </Link>
                <h1 className="text-2xl font-bold">게시물 작성</h1>
            </header>

            <form
                onSubmit={handleSubmit}
                className="mx-auto max-w-2xl flex flex-col gap-5"
                noValidate
            >
                {/* 제목 */}
                <div className="flex flex-col gap-1.5">
                    <label
                        htmlFor="board-title"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                        제목 <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="board-title"
                        type="text"
                        value={form.title}
                        onChange={(e) => setField("title", e.target.value)}
                        placeholder="제목을 입력하세요"
                        maxLength={200}
                        disabled={isSubmitting}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-foreground placeholder-gray-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-900"
                    />
                </div>

                {/* 본문 */}
                <div className="flex flex-col gap-1.5">
                    <label
                        htmlFor="board-content"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                        본문 <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        id="board-content"
                        value={form.content}
                        onChange={(e) => setField("content", e.target.value)}
                        placeholder="내용을 입력하세요"
                        rows={10}
                        disabled={isSubmitting}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-foreground placeholder-gray-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-900"
                    />
                </div>

                {/* 에러 메시지 */}
                {error && (
                    <p role="alert" className="text-sm text-red-500">
                        {error}
                    </p>
                )}

                {/* 버튼 */}
                <div className="flex justify-end gap-3">
                    <Link
                        href="/board"
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                        취소
                    </Link>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-blue-400 dark:focus:ring-offset-gray-900"
                    >
                        {isSubmitting && (
                            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        )}
                        {isSubmitting ? "등록 중..." : "게시물 등록"}
                    </button>
                </div>
            </form>
        </main>
    )
}

"use client"

import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useAtomValue } from "jotai"
import { authStateAtom } from "@/features/auth/application/atoms/authAtom"
import { useBoardEdit } from "@/features/board/application/hooks/useBoardEdit"

export default function BoardEditPage() {
    const params = useParams()
    const router = useRouter()
    const boardId = Number(params.id)
    const authState = useAtomValue(authStateAtom)

    useEffect(() => {
        if (authState.status === "UNAUTHENTICATED") {
            router.replace("/login")
        }
        if (authState.status === "PENDING_TERMS") {
            router.replace("/terms")
        }
    }, [authState.status, router])

    const {
        title,
        content,
        setTitle,
        setContent,
        isLoading,
        isSubmitting,
        loadError,
        submitError,
        submit,
    } = useBoardEdit(boardId)

    if (authState.status !== "AUTHENTICATED") return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const updated = await submit()
        if (updated) router.push(`/board/read/${boardId}`)
    }

    if (isLoading) {
        return (
            <main className="min-h-screen bg-background text-foreground p-6 md:p-10">
                <div className="mx-auto max-w-2xl flex flex-col gap-5">
                    <div className="h-8 w-40 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                    <div className="h-10 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
                    <div className="h-64 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
                </div>
            </main>
        )
    }

    if (loadError) {
        return (
            <main className="min-h-screen bg-background text-foreground p-6 md:p-10">
                <div className="mx-auto max-w-2xl">
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300 mb-6">
                        {loadError}
                    </div>
                    <Link href="/board" className="text-sm text-blue-600 hover:underline dark:text-blue-400">
                        ← 게시판으로 돌아가기
                    </Link>
                </div>
            </main>
        )
    }

    return (
        <main className="min-h-screen bg-background text-foreground p-6 md:p-10">
            <header className="mb-8 flex items-center gap-3">
                <Link
                    href={`/board/read/${boardId}`}
                    className="text-sm text-gray-500 transition-colors hover:text-gray-700 dark:hover:text-gray-300"
                    aria-label="게시물로 돌아가기"
                >
                    ← 게시물
                </Link>
                <h1 className="text-2xl font-bold">게시물 수정</h1>
            </header>

            <form
                onSubmit={handleSubmit}
                className="mx-auto max-w-2xl flex flex-col gap-5"
                noValidate
            >
                <div className="flex flex-col gap-1.5">
                    <label
                        htmlFor="edit-title"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                        제목 <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="edit-title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="제목을 입력하세요"
                        maxLength={200}
                        disabled={isSubmitting}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-foreground placeholder-gray-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-900"
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label
                        htmlFor="edit-content"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                        본문 <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        id="edit-content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="내용을 입력하세요"
                        rows={10}
                        disabled={isSubmitting}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-foreground placeholder-gray-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-900"
                    />
                </div>

                {submitError && (
                    <p role="alert" className="text-sm text-red-500">
                        {submitError}
                    </p>
                )}

                <div className="flex justify-end gap-3">
                    <Link
                        href={`/board/read/${boardId}`}
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
                        {isSubmitting ? "수정 중..." : "수정 완료"}
                    </button>
                </div>
            </form>
        </main>
    )
}

"use client"

import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useBoardDetail } from "@/features/board/application/hooks/useBoardDetail"

export default function BoardDetailPage() {
    const params = useParams()
    const router = useRouter()
    const boardId = Number(params.id)

    const { post, isLoading, error } = useBoardDetail(boardId)

    if (isLoading) {
        return (
            <main className="min-h-screen bg-background text-foreground p-6 md:p-10 max-w-3xl mx-auto">
                <div className="h-8 w-48 rounded bg-gray-200 dark:bg-gray-700 animate-pulse mb-4" />
                <div className="h-4 w-32 rounded bg-gray-100 dark:bg-gray-800 animate-pulse mb-8" />
                <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-4 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
                    ))}
                </div>
            </main>
        )
    }

    if (error || !post) {
        return (
            <main className="min-h-screen bg-background text-foreground p-6 md:p-10 max-w-3xl mx-auto">
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300 mb-6">
                    {error ?? "게시물을 찾을 수 없습니다."}
                </div>
                <Link
                    href="/board"
                    className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                >
                    ← 게시판으로 돌아가기
                </Link>
            </main>
        )
    }

    return (
        <main className="min-h-screen bg-background text-foreground p-6 md:p-10 max-w-3xl mx-auto">
            <nav className="mb-6">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    게시판으로
                </button>
            </nav>

            <article>
                <header className="mb-6 border-b border-gray-200 pb-4 dark:border-gray-700">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 break-keep">
                        {post.title}
                    </h1>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                        <span>{post.nickname}</span>
                        <span>·</span>
                        <time dateTime={post.created_at}>
                            {new Date(post.created_at).toLocaleString("ko-KR", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                        </time>
                    </div>
                </header>

                <div className="prose prose-sm max-w-none text-gray-800 dark:text-gray-200 leading-7 whitespace-pre-wrap">
                    {post.content}
                </div>
            </article>
        </main>
    )
}

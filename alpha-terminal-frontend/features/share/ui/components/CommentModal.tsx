"use client"

import { useEffect, useRef, useState } from "react"
import type { CardComment } from "../../domain/model/sharedCard"
import { getOrCreateGuestName, getNicknameCookie } from "../../infrastructure/utils/guestName"

const MAX_LEN = 120

interface Props {
    cardId: number
    comments: CardComment[]
    loading: boolean
    onOpen: () => void
    onClose: () => void
    onSubmit: (content: string, nickname: string) => Promise<void>
    open: boolean
}

export function CommentModal({ comments, loading, onOpen, onClose, onSubmit, open, cardId }: Props) {
    const [content, setContent] = useState("")
    const [nickname, setNickname] = useState("")
    const [submitting, setSubmitting] = useState(false)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
        if (open) {
            onOpen()
            const loggedIn = getNicknameCookie()
            setNickname(loggedIn ?? getOrCreateGuestName())
            const timer = setTimeout(() => textareaRef.current?.focus(), 100)
            return () => clearTimeout(timer)
        }
    }, [open, onOpen])

    const handleSubmit = async () => {
        if (!content.trim() || content.length > MAX_LEN || submitting) return
        setSubmitting(true)
        try {
            await onSubmit(content.trim(), nickname)
            setContent("")
        } finally {
            setSubmitting(false)
        }
    }

    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
            <button
                className="absolute inset-0 bg-black/60"
                onClick={onClose}
                aria-label="닫기"
            />
            <div className="relative z-10 w-full max-w-lg rounded-t-2xl bg-gray-900 p-5 pb-20 shadow-xl md:rounded-2xl md:pb-5">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-base font-semibold text-gray-100">댓글</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-200"
                        aria-label="닫기"
                    >
                        ✕
                    </button>
                </div>

                {/* 댓글 목록 */}
                <div className="mb-4 max-h-60 overflow-y-auto space-y-3">
                    {loading ? (
                        <p className="text-sm text-gray-400">불러오는 중...</p>
                    ) : comments.length === 0 ? (
                        <p className="text-sm text-gray-500">첫 댓글을 남겨보세요.</p>
                    ) : (
                        comments.map((c) => (
                            <div key={c.id} className="rounded-lg bg-gray-800 px-3 py-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-medium text-blue-400">
                                        {c.author_nickname}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {new Date(c.created_at).toLocaleDateString("ko-KR")}
                                    </span>
                                </div>
                                <p className="mt-1 text-sm text-gray-200">{c.content}</p>
                            </div>
                        ))
                    )}
                </div>

                {/* 댓글 입력 */}
                <div className="space-y-2">
                    {/* 닉네임: 읽기 전용 */}
                    <div className="flex items-center gap-2 rounded-lg bg-gray-800/60 px-3 py-2">
                        <span className="text-xs text-gray-500">작성자</span>
                        <span className="text-sm font-medium text-blue-400">{nickname}</span>
                    </div>
                    <div className="relative">
                        <textarea
                            ref={textareaRef}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="댓글을 입력하세요..."
                            maxLength={MAX_LEN}
                            rows={3}
                            className="w-full resize-none rounded-lg bg-gray-800 px-3 py-2 text-sm text-gray-200 placeholder-gray-500 outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <span
                            className={`absolute bottom-2 right-3 text-xs ${
                                content.length > MAX_LEN ? "text-red-400" : "text-gray-500"
                            }`}
                        >
                            {content.length}/{MAX_LEN}
                        </span>
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={!content.trim() || content.length > MAX_LEN || submitting}
                        className="w-full rounded-lg bg-blue-600 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-40"
                    >
                        {submitting ? "등록 중..." : "댓글 등록"}
                    </button>
                </div>
            </div>
        </div>
    )
}

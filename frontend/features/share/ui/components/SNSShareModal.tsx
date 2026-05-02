"use client"

import { useState } from "react"
import { env } from "@/infrastructure/config/env"

interface Props {
    open: boolean
    onClose: () => void
    cardId: number
    symbol: string
    name: string
    summary: string
}

export function SNSShareModal({ open, onClose, cardId, symbol, name, summary }: Props) {
    const [copied, setCopied] = useState(false)

    if (!open) return null

    const baseUrl = env.shareBaseUrl || (typeof window !== "undefined" ? window.location.origin : "")
    const shareUrl = `${baseUrl}/share/${cardId}`
    const shareText = `[Alpha Terminal AI 분석] ${symbol} ${name}\n${summary.slice(0, 80)}...`
    const shareTitle = `${symbol} ${name} AI 분석`

    // OG 이미지 URL
    const ogImageUrl = `${baseUrl}/api/og?${new URLSearchParams({ symbol, name, summary: summary.slice(0, 200) })}`

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch {
            // fallback
        }
    }

    const handleKakaoTalk = () => {
        if (!window.Kakao?.isInitialized()) {
            alert("카카오 SDK가 초기화되지 않았습니다.")
            return
        }
        window.Kakao.Share.sendDefault({
            objectType: "feed",
            content: {
                title: shareTitle,
                description: summary.slice(0, 100),
                imageUrl: ogImageUrl,
                link: { mobileWebUrl: shareUrl, webUrl: shareUrl },
            },
            buttons: [
                {
                    title: "분석 결과 보기",
                    link: { mobileWebUrl: shareUrl, webUrl: shareUrl },
                },
            ],
        })
    }

    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    const naverBlogUrl = `https://blog.naver.com/openapi/share?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareTitle)}`

    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({ title: shareTitle, text: shareText, url: shareUrl })
            } catch {
                // 취소
            }
        }
    }

    const options = [
        { label: copied ? "복사됨 ✓" : "링크 복사", icon: "🔗", action: handleCopy },
        { label: "카카오톡", icon: "💬", action: handleKakaoTalk },
        { label: "Twitter / X", icon: "🐦", action: () => window.open(twitterUrl, "_blank") },
        { label: "Facebook", icon: "📘", action: () => window.open(facebookUrl, "_blank") },
        { label: "네이버 블로그", icon: "📗", action: () => window.open(naverBlogUrl, "_blank") },
        ...(typeof navigator !== "undefined" && "share" in navigator
            ? [{ label: "더 보기...", icon: "↗️", action: handleNativeShare }]
            : []),
    ]

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
            <button
                className="absolute inset-0 bg-black/60"
                onClick={onClose}
                aria-label="닫기"
            />
            <div className="relative z-10 w-full max-w-sm rounded-t-2xl bg-gray-900 p-5 shadow-xl md:rounded-2xl">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-base font-semibold text-gray-100">공유하기</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-200" aria-label="닫기">
                        ✕
                    </button>
                </div>

                <div className="mb-4 rounded-lg bg-gray-800 px-3 py-2">
                    <p className="truncate text-xs text-gray-400">{shareUrl}</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    {options.map((opt) => (
                        <button
                            key={opt.label}
                            onClick={opt.action}
                            className="flex items-center gap-2 rounded-lg bg-gray-800 px-3 py-3 text-sm text-gray-200 transition hover:bg-gray-700"
                        >
                            <span>{opt.icon}</span>
                            <span>{opt.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

import type { Metadata } from "next"
import Link from "next/link"
import { SharePublicView } from "./SharePublicView"

interface Props {
    params: Promise<{ cardId: string }>
}

// SSR에서는 상대 경로 불가 → 백엔드 직접 호출
const SSR_API_BASE = process.env.INTERNAL_API_URL ?? "http://localhost:33333"
const SHARE_BASE = process.env.NEXT_PUBLIC_SHARE_BASE_URL ?? "http://localhost:3000"

async function fetchCard(cardId: string) {
    try {
        const res = await fetch(`${SSR_API_BASE}/card-share/${cardId}`, {
            next: { revalidate: 60 },
        })
        if (!res.ok) return null
        return res.json()
    } catch {
        return null
    }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { cardId } = await params
    const card = await fetchCard(cardId)
    if (!card) {
        return { title: "Alpha Terminal - 공유 카드" }
    }
    const sentimentLabel: Record<string, string> = {
        POSITIVE: "긍정",
        NEGATIVE: "부정",
        NEUTRAL: "중립",
    }
    const title = `[Alpha Terminal] ${card.symbol} ${card.name} AI 분석`
    const description = `${sentimentLabel[card.sentiment] ?? ""} ${card.sentiment_score > 0 ? "+" : ""}${card.sentiment_score.toFixed(2)} | ${card.summary.slice(0, 100)}...`

    const ogImageParams = new URLSearchParams({
        symbol: card.symbol,
        name: card.name,
        summary: card.summary.slice(0, 200),
        sentiment: card.sentiment,
        score: String(card.sentiment_score),
        confidence: String(card.confidence),
    })
    const ogImageUrl = `${SHARE_BASE}/api/og?${ogImageParams}`
    const shareUrl = `${SHARE_BASE}/share/${cardId}`

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: "article",
            siteName: "Alpha Terminal",
            url: shareUrl,
            images: [{ url: ogImageUrl, width: 1200, height: 630, alt: title }],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [ogImageUrl],
        },
    }
}

export default async function SharePage({ params }: Props) {
    const { cardId } = await params
    const card = await fetchCard(cardId)

    if (!card) {
        return (
            <main className="mx-auto max-w-lg px-4 py-16 text-center">
                <p className="text-gray-400">카드를 찾을 수 없습니다.</p>
                <Link href="/" className="mt-4 inline-block text-sm text-blue-400 hover:underline">
                    홈으로 돌아가기
                </Link>
            </main>
        )
    }

    return <SharePublicView card={card} />
}

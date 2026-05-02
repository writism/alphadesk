export const MARKET_BADGE: Record<string, string> = {
    KOSPI: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    KOSDAQ: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    NASDAQ: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
    NYSE: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
}

export const SENTIMENT_BADGE: Record<string, string> = {
    POSITIVE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    NEGATIVE: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
    NEUTRAL: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
}

export function MarketBadge({ market }: { market?: string | null }) {
    if (!market) return null
    const cls = MARKET_BADGE[market] ?? "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
    return (
        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${cls}`}>
            {market}
        </span>
    )
}

export function formatAnalyzedAt(value: string) {
    return new Intl.DateTimeFormat("ko-KR", {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(value))
}

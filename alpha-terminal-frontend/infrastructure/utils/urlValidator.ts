/**
 * API 응답 등 외부에서 받은 URL을 href/src에 사용하기 전에 검증합니다.
 * javascript:, data: 등 위험한 프로토콜을 차단합니다.
 */
export function isSafeUrl(url: string | undefined | null): boolean {
    if (!url) return false
    try {
        const parsed = new URL(url)
        return parsed.protocol === "http:" || parsed.protocol === "https:"
    } catch {
        return false
    }
}

export function getSafeUrl(url: string | undefined | null, fallback = "#"): string {
    return isSafeUrl(url) ? url! : fallback
}

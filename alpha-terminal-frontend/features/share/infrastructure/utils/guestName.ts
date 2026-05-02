const ADJECTIVES = [
    "빠른", "용감한", "행복한", "슬기로운", "멋진",
    "귀여운", "씩씩한", "따뜻한", "활발한", "신나는",
    "재빠른", "차가운", "밝은", "조용한", "엉뚱한",
]

const NOUNS = [
    "고양이", "강아지", "토끼", "여우", "곰",
    "사자", "호랑이", "펭귄", "판다", "독수리",
    "수달", "하마", "기린", "코끼리", "늑대",
]

const COOKIE_KEY = "anon_name"
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 year

function generate(): string {
    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)]
    const num = Math.floor(1000 + Math.random() * 9000)
    return `${adj} ${noun} ${num}`
}

function readCookie(key: string): string | null {
    if (typeof document === "undefined") return null
    const match = document.cookie
        .split("; ")
        .find((row) => row.startsWith(`${key}=`))
    return match ? decodeURIComponent(match.split("=")[1]) : null
}

function writeCookie(key: string, value: string) {
    document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`
}

export function getOrCreateGuestName(): string {
    const existing = readCookie(COOKIE_KEY)
    if (existing) return existing
    const name = generate()
    writeCookie(COOKIE_KEY, name)
    return name
}

export function getNicknameCookie(): string | null {
    return readCookie("nickname")
}

export function getAccountIdCookie(): number | null {
    const v = readCookie("account_id")
    if (!v) return null
    const n = Number(v)
    return isNaN(n) ? null : n
}

function generateUUID(): string {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0
        const v = c === "x" ? r : (r & 0x3) | 0x8
        return v.toString(16)
    })
}

export function getOrCreateGuestId(): string {
    const existing = readCookie("guest_id")
    if (existing) return existing
    const id =
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
            ? crypto.randomUUID()
            : generateUUID()
    writeCookie("guest_id", id)
    return id
}

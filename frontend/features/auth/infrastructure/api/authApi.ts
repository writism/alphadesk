import { env } from "@/infrastructure/config/env"
import { readApiError } from "@/infrastructure/http/apiError"

export { ApiError } from "@/infrastructure/http/apiError"
import { httpClient } from "@/infrastructure/http/httpClient"
import { getCookie } from "@/infrastructure/utils/cookie"
import type { AuthUser } from "../../domain/model/authUser"
import type { AuthState } from "../../domain/state/authState"

export function redirectOAuthLogin() {
    window.location.href = `${env.apiBaseUrl}${env.kakaoLoginPath}`
}

export function getCurrentUserFromCookie(): AuthUser | null {
    const nickname = getCookie("nickname")
    const email = getCookie("email")
    const accountId = getCookie("account_id")
    if (!nickname || !email || !accountId) return null
    return { nickname, email, accountId }
}

export function detectAuthState(): AuthState {
    const user = getCurrentUserFromCookie()
    if (user) return { status: "AUTHENTICATED", user }
    return { status: "UNAUTHENTICATED" }
}

export async function logoutUser(): Promise<void> {
    try {
        await httpClient.post("/account/logout")
    } finally {
        clearAuthCookies()
    }
}

function clearAuthCookies() {
    for (const name of ["nickname", "email", "account_id"]) {
        document.cookie = `${name}=; Max-Age=0; path=/`
    }
}

export interface AuthMeResponse {
    is_registered: boolean
    nickname: string
    email: string
    account_id?: string
}

export function mapAuthMeToState(me: AuthMeResponse): AuthState {
    if (!me.is_registered) {
        return { status: "PENDING_TERMS" }
    }

    return {
        status: "AUTHENTICATED",
        user: {
            nickname: me.nickname,
            email: me.email,
            accountId: me.account_id ?? "",
        },
    }
}

export async function fetchAuthMe(): Promise<AuthMeResponse> {
    const res = await httpClient.get("/authentication/me")
    return res.json()
}

export async function fetchAuthState(): Promise<AuthState> {
    try {
        return mapAuthMeToState(await fetchAuthMe())
    } catch {
        return detectAuthState()
    }
}

export async function registerUser(params: { nickname: string; email: string }): Promise<string> {
    const res = await fetch(`${env.apiBaseUrl}/account/register`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
    })
    if (!res.ok) throw await readApiError(res)
    const body = await res.json()
    return body.redirect_url as string
}

export interface SignupRequest {
    readonly nickname: string
    readonly email: string
}

export async function signUpUser(request: SignupRequest): Promise<string> {
    return registerUser(request)
}

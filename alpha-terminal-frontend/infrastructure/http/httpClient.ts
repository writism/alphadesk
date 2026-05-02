import { env } from "@/infrastructure/config/env"
import { readApiError } from "./apiError"

const TIMEOUT_MS = 15_000

async function ensureOk(res: Response): Promise<Response> {
    if (!res.ok) throw await readApiError(res)
    return res
}

function fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
    return fetch(url, { ...init, signal: controller.signal }).finally(() =>
        clearTimeout(timer),
    )
}

export const httpClient = {
    get: async (path: string) => {
        const res = await fetchWithTimeout(`${env.apiBaseUrl}${path}`, {
            method: "GET",
            credentials: "include",
        })
        return ensureOk(res)
    },

    post: async (path: string, body?: unknown) => {
        const res = await fetchWithTimeout(`${env.apiBaseUrl}${path}`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: body !== undefined ? JSON.stringify(body) : undefined,
        })
        return ensureOk(res)
    },

    put: async (path: string, body?: unknown) => {
        const res = await fetchWithTimeout(`${env.apiBaseUrl}${path}`, {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: body !== undefined ? JSON.stringify(body) : undefined,
        })
        return ensureOk(res)
    },

    patch: async (path: string, body?: unknown) => {
        const res = await fetchWithTimeout(`${env.apiBaseUrl}${path}`, {
            method: "PATCH",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: body !== undefined ? JSON.stringify(body) : undefined,
        })
        return ensureOk(res)
    },

    delete: async (path: string) => {
        const res = await fetchWithTimeout(`${env.apiBaseUrl}${path}`, {
            method: "DELETE",
            credentials: "include",
        })
        return ensureOk(res)
    },
}

/**
 * JSON 응답을 제네릭 타입 T 로 반환하는 얇은 fetch 래퍼.
 *
 * - `parse` 가 제공되면 런타임 검증/정제 결과를 반환한다 (Zod 등과 결합 용이).
 * - `parse` 가 없으면 `response.json()` 을 `T` 로 단언한다. 계약상 신뢰하는 내부 API 에 사용한다.
 * - path 가 절대 URL 이면 그대로, 그렇지 않으면 `env.apiBaseUrl` 프리픽스를 붙인다.
 *
 * 호출측이 `fetch(...).json()` 을 직접 쓰던 경로를 대체하기 위해 도입되었다.
 */
export async function requestJson<T>(
    path: string,
    init?: RequestInit,
    parse?: (raw: unknown) => T,
): Promise<T> {
    const url = /^https?:\/\//i.test(path) ? path : `${env.apiBaseUrl}${path}`
    const res = await fetch(url, {
        credentials: "include",
        ...init,
    })
    if (!res.ok) throw await readApiError(res)
    const raw = (await res.json()) as unknown
    return parse ? parse(raw) : (raw as T)
}

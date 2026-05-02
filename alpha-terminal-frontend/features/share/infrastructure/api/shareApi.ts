import type {
    CardCommentListResponse,
    LikeToggleResponse,
    ShareCardPayload,
    SharedCard,
    SharedCardListResponse,
} from "../../domain/model/sharedCard"

const BASE = "/api"

async function request<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${BASE}${path}`, {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        ...options,
    })
    if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error((err as { detail?: string }).detail ?? `Request failed: ${res.status}`)
    }
    return res.json() as Promise<T>
}

export async function shareCard(payload: ShareCardPayload): Promise<SharedCard> {
    return request<SharedCard>("/card-share", {
        method: "POST",
        body: JSON.stringify(payload),
    })
}

export async function fetchSharedCards(limit = 20, offset = 0): Promise<SharedCardListResponse> {
    return request<SharedCardListResponse>(`/card-share?limit=${limit}&offset=${offset}`)
}

export async function fetchSharedCard(cardId: number): Promise<SharedCard> {
    return request<SharedCard>(`/card-share/${cardId}`)
}

export async function toggleLike(cardId: number): Promise<LikeToggleResponse> {
    return request<LikeToggleResponse>(`/card-share/${cardId}/likes`, { method: "POST" })
}

export async function fetchComments(cardId: number): Promise<CardCommentListResponse> {
    return request<CardCommentListResponse>(`/card-share/${cardId}/comments`)
}

export async function addComment(
    cardId: number,
    content: string,
    author_nickname?: string
): Promise<void> {
    await request(`/card-share/${cardId}/comments`, {
        method: "POST",
        body: JSON.stringify({ content, author_nickname }),
    })
}

export async function deleteSharedCard(cardId: number): Promise<void> {
    await request(`/card-share/${cardId}`, { method: "DELETE" })
}

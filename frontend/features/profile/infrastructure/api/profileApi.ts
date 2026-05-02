import { httpClient } from "@/infrastructure/http/httpClient"
import type { UserProfile } from "../../domain/model/userProfile"

export interface SaveRecentlyViewedPayload {
    symbol: string
    name: string
    market?: string
}

export interface SaveRecentlyViewedResponse {
    symbol: string
    name: string
    market?: string
    viewed_at: string
}

export interface SaveClickedCardPayload {
    symbol: string
    name: string
    market?: string
}

export interface SaveClickedCardResponse {
    symbol: string
    name: string
    market?: string
    count: number
}

export async function getUserProfile(userId: string): Promise<UserProfile> {
    const res = await httpClient.get(`/users/${userId}/profile`)
    return res.json()
}

export async function saveRecentlyViewed(
    userId: string,
    payload: SaveRecentlyViewedPayload,
): Promise<SaveRecentlyViewedResponse> {
    const res = await httpClient.post(`/users/${userId}/recently-viewed`, payload)
    return res.json()
}

export async function saveClickedCard(
    userId: string,
    payload: SaveClickedCardPayload,
): Promise<SaveClickedCardResponse> {
    const res = await httpClient.post(`/users/${userId}/clicked-cards`, payload)
    return res.json()
}

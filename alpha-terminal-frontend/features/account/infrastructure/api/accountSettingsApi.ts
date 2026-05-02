import { httpClient } from "@/infrastructure/http/httpClient"

export interface AccountSettings {
    is_watchlist_public: boolean
}

export async function fetchAccountSettings(): Promise<AccountSettings> {
    const res = await httpClient.get("/account/settings")
    return res.json()
}

export async function updateAccountSettings(settings: AccountSettings): Promise<AccountSettings> {
    const res = await httpClient.patch("/account/settings", settings)
    return res.json()
}

import type { SWRConfiguration } from "swr"

export const swrConfig: SWRConfiguration = {
    dedupingInterval: 10 * 60 * 1000,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    errorRetryCount: 2,
    errorRetryInterval: 3000,
}

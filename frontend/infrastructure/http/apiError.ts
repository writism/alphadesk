export class ApiError extends Error {
    constructor(
        public readonly status: number,
        message: string,
    ) {
        super(message)
        this.name = "ApiError"
    }
}

function detailToMessage(detail: unknown): string | null {
    if (typeof detail === "string") return detail
    if (Array.isArray(detail)) {
        const first = detail[0]
        if (first && typeof first === "object" && "msg" in first) {
            return String((first as { msg: unknown }).msg)
        }
    }
    return null
}

export async function readApiError(res: Response): Promise<ApiError> {
    const text = await res.text()
    let message = `HTTP ${res.status}`
    if (text) {
        try {
            const data = JSON.parse(text) as unknown
            if (data && typeof data === "object" && "detail" in data) {
                const parsed = detailToMessage((data as { detail: unknown }).detail)
                if (parsed) message = parsed
                else message = text.length > 200 ? `${text.slice(0, 200)}…` : text
            } else {
                message = text.length > 200 ? `${text.slice(0, 200)}…` : text
            }
        } catch {
            message = text.length > 200 ? `${text.slice(0, 200)}…` : text
        }
    }
    return new ApiError(res.status, message)
}

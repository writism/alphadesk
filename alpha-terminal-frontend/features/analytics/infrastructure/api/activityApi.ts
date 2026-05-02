import { httpClient } from "@/infrastructure/http/httpClient"

export type EventType = "visit" | "app_open" | "core_start" | "core_complete"

export async function recordEvent(eventType: EventType, campaign?: string): Promise<void> {
    try {
        await httpClient.post("/analytics/event", { event_type: eventType, campaign })
    } catch {
        // 이벤트 로깅 실패는 사용자 경험에 영향 없이 무시
    }
}

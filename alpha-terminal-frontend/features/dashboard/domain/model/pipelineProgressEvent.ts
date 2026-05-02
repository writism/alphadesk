/**
 * BL-BE-12 스트림 계약과 맞춘다. 백엔드 미구현 시에는 사용되지 않을 수 있다.
 */
export type PipelineProgressEventType = "progress" | "result" | "error" | "done"

export interface PipelineProgressEvent {
    type: PipelineProgressEventType
    at: string
    message: string
    phase?: string
    symbol?: string
    source?: string
    progress?: { current?: number; total?: number }
}

/** BL-FE-29: 스트림 없이 동기 실행 시 표시하는 일반 진행 메시지(특정 소스명 없음) */
export function createFallbackPipelineProgressEvent(): PipelineProgressEvent {
    return {
        type: "progress",
        at: new Date().toISOString(),
        message: "서버에서 파이프라인을 실행하는 중입니다. 잠시만 기다려 주세요.",
        phase: "RUN",
    }
}

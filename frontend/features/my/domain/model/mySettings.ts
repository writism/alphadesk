export interface BriefingTimeSettings {
    korea_time: number
    us_time: number
}

// 한국 증시 브리핑 07:00 KST
// 미국 증시 브리핑 21:00 KST
export const BRIEFING_DEFAULTS: BriefingTimeSettings = {
    korea_time: 7,
    us_time: 21,
}

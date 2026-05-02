import { ImageResponse } from "next/og"
import { NextRequest } from "next/server"

export const runtime = "edge"

const SENTIMENT_COLOR: Record<string, { bg: string; text: string; label: string }> = {
    POSITIVE: { bg: "#dcfce7", text: "#15803d", label: "긍정" },
    NEGATIVE: { bg: "#fee2e2", text: "#b91c1c", label: "부정" },
    NEUTRAL: { bg: "#f3f4f6", text: "#4b5563", label: "중립" },
}

/** 등락률 → 색상 (한국 주식 컨벤션: 빨강=상승, 파랑=하락, 회색=보합) */
function returnColor(val: number): string {
    if (val > 2) return "#dc2626"     // 강한 상승 — 진한 빨강
    if (val > 0.5) return "#ef4444"   // 상승 — 빨강
    if (val > 0) return "#f87171"     // 약한 상승 — 연한 빨강
    if (val < -2) return "#1d4ed8"    // 강한 하락 — 진한 파랑
    if (val < -0.5) return "#3b82f6"  // 하락 — 파랑
    if (val < 0) return "#60a5fa"     // 약한 하락 — 연한 파랑
    return "#6b7280"                  // 보합 — 회색
}

export async function GET(req: NextRequest) {
    const { searchParams } = req.nextUrl
    const symbol = searchParams.get("symbol") ?? ""
    const name = searchParams.get("name") ?? ""
    const summary = searchParams.get("summary") ?? ""
    const sentiment = searchParams.get("sentiment") ?? "NEUTRAL"
    const score = searchParams.get("score") ?? "0"
    const confidence = searchParams.get("confidence") ?? "0"
    const returnsRaw = searchParams.get("returns") ?? ""

    const s = SENTIMENT_COLOR[sentiment] ?? SENTIMENT_COLOR.NEUTRAL
    const scoreNum = parseFloat(score)
    const confNum = Math.round(parseFloat(confidence) * 100)

    // returns: 쉼표로 구분된 일별 등락률 (예: "1.2,-0.5,0.8,-1.1,2.3")
    const returns = returnsRaw
        ? returnsRaw.split(",").map(Number).filter((n) => !isNaN(n))
        : []

    return new ImageResponse(
        (
            <div
                style={{
                    width: "1200px",
                    height: "630px",
                    display: "flex",
                    flexDirection: "column",
                    backgroundColor: "#111827",
                    padding: "60px",
                    fontFamily: "sans-serif",
                }}
            >
                {/* Header */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "32px",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "baseline", gap: "16px" }}>
                        <span style={{ fontSize: "48px", fontWeight: 700, color: "#f9fafb" }}>
                            {symbol}
                        </span>
                        <span style={{ fontSize: "28px", color: "#9ca3af" }}>{name}</span>
                    </div>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            backgroundColor: s.bg,
                            color: s.text,
                            padding: "8px 24px",
                            borderRadius: "9999px",
                            fontSize: "24px",
                            fontWeight: 600,
                        }}
                    >
                        {s.label} {scoreNum > 0 ? "+" : ""}
                        {scoreNum.toFixed(2)}
                    </div>
                </div>

                {/* Summary */}
                <div
                    style={{
                        fontSize: "26px",
                        lineHeight: "1.6",
                        color: "#d1d5db",
                        display: "flex",
                        marginBottom: "28px",
                    }}
                >
                    {summary.length > 180 ? summary.slice(0, 180) + "..." : summary}
                </div>

                {/* 등락 히트맵 바 */}
                {returns.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "28px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ fontSize: "18px", color: "#9ca3af" }}>최근 {returns.length}일 등락</span>
                            <div style={{ display: "flex", alignItems: "center", gap: "4px", marginLeft: "12px" }}>
                                <div style={{ width: "10px", height: "10px", borderRadius: "2px", backgroundColor: "#ef4444" }} />
                                <span style={{ fontSize: "14px", color: "#6b7280" }}>상승</span>
                                <div style={{ width: "10px", height: "10px", borderRadius: "2px", backgroundColor: "#3b82f6", marginLeft: "8px" }} />
                                <span style={{ fontSize: "14px", color: "#6b7280" }}>하락</span>
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: "4px", height: "40px" }}>
                            {returns.map((val, i) => (
                                <div
                                    key={i}
                                    style={{
                                        flex: 1,
                                        height: "40px",
                                        backgroundColor: returnColor(val),
                                        borderRadius: "4px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <span style={{ fontSize: "12px", color: "#fff", fontWeight: 600 }}>
                                        {val > 0 ? "+" : ""}{val.toFixed(1)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 공간 채우기 */}
                <div style={{ flex: 1, display: "flex" }} />

                {/* Footer */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingTop: "24px",
                        borderTop: "1px solid #374151",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "22px", color: "#9ca3af" }}>신뢰도</span>
                        <div
                            style={{
                                width: "200px",
                                height: "8px",
                                backgroundColor: "#374151",
                                borderRadius: "9999px",
                                display: "flex",
                                overflow: "hidden",
                            }}
                        >
                            <div
                                style={{
                                    width: `${confNum}%`,
                                    height: "100%",
                                    backgroundColor: "#60a5fa",
                                    borderRadius: "9999px",
                                }}
                            />
                        </div>
                        <span style={{ fontSize: "22px", color: "#9ca3af" }}>{confNum}%</span>
                    </div>
                    <span style={{ fontSize: "24px", fontWeight: 600, color: "#6b7280" }}>
                        Alpha Desk AI
                    </span>
                </div>
            </div>
        ),
        {
            width: 1200,
            height: 630,
        },
    )
}

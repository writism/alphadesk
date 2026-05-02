"use client"

import { useState } from "react"
import { useAdminStats } from "@/features/admin/application/hooks/useAdminStats"
import { useAdminUsers } from "@/features/admin/application/hooks/useAdminUsers"
import { useAdminLogs } from "@/features/admin/application/hooks/useAdminLogs"
import type { AdminUserItem, AdminLogItem } from "@/features/admin/domain/model/adminStats"

type Tab = "OVERVIEW" | "USERS" | "LOGS"

function StatCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="border border-outline px-5 py-4">
            <p className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">{label}</p>
            <p className="mt-1 font-mono text-2xl font-bold text-on-surface">{value}</p>
        </div>
    )
}

function RoleBadge({ role }: { role: string }) {
    return (
        <span className={`font-mono text-[9px] uppercase px-1.5 py-0.5 ${
            role === "ADMIN"
                ? "bg-primary/20 text-primary border border-primary/40"
                : "bg-surface-container text-on-surface-variant border border-outline"
        }`}>
            {role}
        </span>
    )
}

function SentimentBadge({ sentiment }: { sentiment: string }) {
    const color =
        sentiment === "POSITIVE" ? "text-green-500" :
        sentiment === "NEGATIVE" ? "text-error" :
        "text-on-surface-variant"
    return <span className={`font-mono text-[10px] uppercase ${color}`}>{sentiment}</span>
}

function OverviewTab() {
    const { stats, status } = useAdminStats()

    if (status === "loading") return <div className="py-16 text-center font-mono text-xs text-on-surface-variant">LOADING...</div>
    if (status === "error" || !stats) return <div className="py-16 text-center font-mono text-xs text-error">[ERROR] 통계를 불러오지 못했습니다.</div>

    const dwellMin = stats.avg_dwell_time_seconds != null
        ? `${Math.floor(stats.avg_dwell_time_seconds / 60)}m ${Math.round(stats.avg_dwell_time_seconds % 60)}s`
        : "N/A"

    return (
        <div className="space-y-8">
            <section>
                <h2 className="mb-3 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">USER STATS</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <StatCard label="전체 유저" value={stats.total_users.toLocaleString()} />
                    <StatCard label="오늘 신규" value={stats.new_users_today.toLocaleString()} />
                    <StatCard label="이번주 신규" value={stats.new_users_this_week.toLocaleString()} />
                    <StatCard label="평균 체류시간" value={dwellMin} />
                    <StatCard label="Activation Rate" value={stats.ctr != null ? `${(stats.ctr * 100).toFixed(1)}%` : "N/A"} />
                </div>
            </section>
            <section>
                <h2 className="mb-3 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">RETENTION (D-1 ~ D-14)</h2>
                <div className="border border-outline p-4 space-y-2">
                    {stats.retention.map(({ day, rate }) => (
                        <div key={day} className="flex items-center gap-3">
                            <span className="w-10 shrink-0 font-mono text-[10px] text-on-surface-variant">D-{day}</span>
                            <div className="flex-1 bg-surface-container h-3 overflow-hidden">
                                <div className="h-full bg-primary" style={{ width: `${(rate * 100).toFixed(1)}%` }} />
                            </div>
                            <span className="w-12 text-right font-mono text-[10px] text-on-surface">{(rate * 100).toFixed(1)}%</span>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    )
}

function UsersTab() {
    const { users, total, page, setPage, isLoading, updateRole } = useAdminUsers()
    const PAGE_SIZE = 20
    const totalPages = Math.ceil(total / PAGE_SIZE)

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-on-surface-variant">전체 {total.toLocaleString()}명</span>
            </div>

            <div className="border border-outline overflow-x-auto">
                <table className="w-full font-mono text-[11px]">
                    <thead>
                        <tr className="border-b border-outline bg-surface-container">
                            <th className="text-left px-3 py-2 text-on-surface-variant uppercase tracking-widest text-[9px]">ID</th>
                            <th className="text-left px-3 py-2 text-on-surface-variant uppercase tracking-widest text-[9px]">닉네임</th>
                            <th className="text-left px-3 py-2 text-on-surface-variant uppercase tracking-widest text-[9px]">이메일</th>
                            <th className="text-left px-3 py-2 text-on-surface-variant uppercase tracking-widest text-[9px]">가입일</th>
                            <th className="text-left px-3 py-2 text-on-surface-variant uppercase tracking-widest text-[9px]">역할</th>
                            <th className="text-left px-3 py-2 text-on-surface-variant uppercase tracking-widest text-[9px]">변경</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={6} className="text-center py-8 text-on-surface-variant">LOADING...</td></tr>
                        ) : users.map((user: AdminUserItem) => (
                            <tr key={user.id} className="border-b border-outline-variant/30 hover:bg-surface-container-high">
                                <td className="px-3 py-2 text-on-surface-variant">{user.id}</td>
                                <td className="px-3 py-2 text-on-surface font-bold">{user.nickname}</td>
                                <td className="px-3 py-2 text-on-surface-variant">{user.email}</td>
                                <td className="px-3 py-2 text-on-surface-variant">
                                    {new Date(user.created_at).toLocaleDateString("ko-KR")}
                                </td>
                                <td className="px-3 py-2"><RoleBadge role={user.role} /></td>
                                <td className="px-3 py-2">
                                    <button
                                        type="button"
                                        onClick={() => updateRole(user.id, user.role === "ADMIN" ? "NORMAL" : "ADMIN")}
                                        className="border border-outline px-2 py-0.5 text-[9px] uppercase hover:bg-surface-container-high"
                                    >
                                        {user.role === "ADMIN" ? "→ NORMAL" : "→ ADMIN"}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="flex items-center gap-2 font-mono text-[10px]">
                    <button
                        type="button"
                        disabled={page === 1}
                        onClick={() => setPage((p) => p - 1)}
                        className="border border-outline px-2 py-1 disabled:opacity-30 hover:bg-surface-container"
                    >
                        PREV
                    </button>
                    <span className="text-on-surface-variant">{page} / {totalPages}</span>
                    <button
                        type="button"
                        disabled={page === totalPages}
                        onClick={() => setPage((p) => p + 1)}
                        className="border border-outline px-2 py-1 disabled:opacity-30 hover:bg-surface-container"
                    >
                        NEXT
                    </button>
                </div>
            )}
        </div>
    )
}

function LogsTab() {
    const { logs, total, isLoading } = useAdminLogs(50)

    return (
        <div className="space-y-4">
            <span className="font-mono text-[10px] text-on-surface-variant">최근 50건 / 전체 {total.toLocaleString()}건</span>
            <div className="border border-outline overflow-x-auto">
                <table className="w-full font-mono text-[11px]">
                    <thead>
                        <tr className="border-b border-outline bg-surface-container">
                            <th className="text-left px-3 py-2 text-on-surface-variant uppercase tracking-widest text-[9px]">종목</th>
                            <th className="text-left px-3 py-2 text-on-surface-variant uppercase tracking-widest text-[9px]">분석일시</th>
                            <th className="text-left px-3 py-2 text-on-surface-variant uppercase tracking-widest text-[9px]">감성</th>
                            <th className="text-left px-3 py-2 text-on-surface-variant uppercase tracking-widest text-[9px]">점수</th>
                            <th className="text-left px-3 py-2 text-on-surface-variant uppercase tracking-widest text-[9px]">소스</th>
                            <th className="text-left px-3 py-2 text-on-surface-variant uppercase tracking-widest text-[9px]">유저ID</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={6} className="text-center py-8 text-on-surface-variant">LOADING...</td></tr>
                        ) : logs.map((log: AdminLogItem) => (
                            <tr key={log.id} className="border-b border-outline-variant/30 hover:bg-surface-container-high">
                                <td className="px-3 py-2">
                                    <span className="font-bold text-on-surface">{log.symbol}</span>
                                    <span className="ml-1 text-on-surface-variant">{log.name}</span>
                                </td>
                                <td className="px-3 py-2 text-on-surface-variant">
                                    {new Date(log.analyzed_at).toLocaleString("ko-KR")}
                                </td>
                                <td className="px-3 py-2"><SentimentBadge sentiment={log.sentiment} /></td>
                                <td className="px-3 py-2 text-on-surface">{(log.sentiment_score * 100).toFixed(0)}%</td>
                                <td className="px-3 py-2 text-on-surface-variant">{log.source_type ?? "-"}</td>
                                <td className="px-3 py-2 text-on-surface-variant">{log.account_id ?? "-"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default function AdminPage() {
    const { status } = useAdminStats()
    const [tab, setTab] = useState<Tab>("OVERVIEW")

    if (status === "forbidden") {
        return (
            <div className="flex h-64 items-center justify-center font-mono text-xs text-error">
                [403] 관리자 권한이 필요합니다.
            </div>
        )
    }

    const tabs: Tab[] = ["OVERVIEW", "USERS", "LOGS"]

    return (
        <>
            <div className="sticky top-0 z-40 bg-surface border-b border-outline">
                <div className="max-w-5xl mx-auto px-6 md:px-8 flex items-center justify-between py-3">
                    <div className="font-mono text-xs uppercase">
                        <span className="font-bold tracking-widest text-on-surface">ADMIN</span>
                        <span className="ml-2 text-[9px] text-on-surface-variant/60 normal-case">관리자 대시보드</span>
                    </div>
                    <div className="flex gap-1">
                        {tabs.map((t) => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => setTab(t)}
                                className={`font-mono text-[10px] uppercase px-3 py-1 border transition-none ${
                                    tab === t
                                        ? "bg-primary text-white border-primary"
                                        : "border-outline text-on-surface-variant hover:bg-surface-container"
                                }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <main className="max-w-5xl mx-auto px-6 md:px-8 pt-6 pb-24 md:pb-8">
                {tab === "OVERVIEW" && <OverviewTab />}
                {tab === "USERS" && <UsersTab />}
                {tab === "LOGS" && <LogsTab />}
            </main>
        </>
    )
}

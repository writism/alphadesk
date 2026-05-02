"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useCallback } from "react"
import { useAuth } from "@/features/auth/application/hooks/useAuth"
import NotificationBell from "@/features/notification/ui/components/NotificationBell"

const NAV_ITEMS = [
    { href: "/", label: "HOME", exact: true },
    { href: "/dashboard", label: "DASHBOARD" },
    { href: "/market-feed", label: "MARKET_FEED" },
    { href: "/ai-insight", label: "AI_INSIGHT" },
    { href: "/board", label: "BOARD" },
]

export default function TopBar() {
    const { state, logout } = useAuth()
    const router = useRouter()
    const pathname = usePathname()
    const isLoggedIn = state.status === "AUTHENTICATED"

    const handleLogout = useCallback(async () => {
        await logout()
        router.push("/")
    }, [logout, router])

    return (
        <header className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center w-full px-2 h-10 bg-inverse-surface border-b border-outline">
            <div className="flex items-center gap-6">
                <Link
                    href="/"
                    className="text-lg font-black tracking-tighter text-inverse-primary font-headline uppercase"
                >
                    ALPHA_TERMINAL
                </Link>

                <nav className="hidden md:flex items-center gap-4 font-headline uppercase tracking-tighter text-sm font-bold h-10">
                    {NAV_ITEMS.map(({ href, label, exact }) => (
                        <Link
                            key={label}
                            href={href}
                            className={
                                (exact ? pathname === href : pathname.startsWith(href))
                                    ? "text-inverse-primary border-b-2 border-inverse-primary pb-1"
                                    : "text-inverse-on-surface opacity-50 hover:opacity-100 hover:text-inverse-on-surface transition-none px-1"
                            }
                        >
                            {label}
                        </Link>
                    ))}
                </nav>
            </div>

            <div className="flex items-center gap-2">
{isLoggedIn && state.status === "AUTHENTICATED" && (
                    <Link
                        href="/my"
                        className={`flex items-center gap-1.5 border px-2 py-0.5 font-mono text-[10px] tracking-widest max-w-[160px] sm:max-w-none transition-none ${
                            pathname === "/my" || pathname.startsWith("/my/")
                                ? "border-inverse-primary bg-inverse-primary/15 text-inverse-primary font-bold"
                                : "border-outline-variant text-inverse-on-surface opacity-50 hover:opacity-100 hover:border-inverse-primary hover:text-inverse-on-surface"
                        }`}
                    >
                        <span className="material-symbols-outlined text-[13px] shrink-0">person</span>
                        <span className="hidden sm:flex flex-col min-w-0">
                            <span className="uppercase truncate leading-tight">{state.user.nickname}</span>
                            {state.user.email && (
                                <span className="text-[9px] opacity-70 truncate normal-case leading-tight">{state.user.email}</span>
                            )}
                        </span>
                    </Link>
                )}

                {isLoggedIn && <NotificationBell />}

                {isLoggedIn ? (
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="border border-outline-variant font-mono text-[10px] text-inverse-on-surface px-2 py-0.5 hover:bg-error hover:text-white hover:border-error transition-none uppercase cursor-pointer"
                    >
                        SYS_LOGOUT
                    </button>
                ) : (
                    <Link
                        href="/login"
                        className="bg-primary text-white font-mono text-[10px] px-2 py-0.5 hover:opacity-90 uppercase"
                    >
                        SYS_LOGIN
                    </Link>
                )}
            </div>
        </header>
    )
}

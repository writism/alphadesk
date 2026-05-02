"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useCallback, useEffect, useId, useState } from "react"
import { useAuth } from "@/features/auth/application/hooks/useAuth"
import { navbarStyles } from "./navbar.styles"
import NotificationBell from "@/features/notification/ui/components/NotificationBell"

function MenuIcon({ open }: { open: boolean }) {
    return (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            {open ? (
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                />
            ) : (
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                />
            )}
        </svg>
    )
}

export default function Navbar() {
    const { state, logout } = useAuth()
    const router = useRouter()
    const pathname = usePathname()
    const panelId = useId()
    const [mobileOpen, setMobileOpen] = useState(false)

    const isLoggedIn = state.status === "AUTHENTICATED"
    const isLoading = state.status === "LOADING" || state.status === "PENDING_TERMS"

    const closeMobile = useCallback(() => setMobileOpen(false), [])

    const menuItemClass = (href: string) =>
        `${navbarStyles.menuItem.base} ${pathname === href ? navbarStyles.menuItem.active : navbarStyles.menuItem.inactive}`

    const drawerLinkClass = (href: string) =>
        `${navbarStyles.drawerLink} ${pathname === href ? navbarStyles.menuItem.active : navbarStyles.menuItem.inactive}`

    const handleLogout = async () => {
        closeMobile()
        await logout()
        router.push("/")
    }

    useEffect(() => {
        if (!mobileOpen) return
        const prev = document.body.style.overflow
        document.body.style.overflow = "hidden"
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") closeMobile()
        }
        window.addEventListener("keydown", onKey)
        return () => {
            document.body.style.overflow = prev
            window.removeEventListener("keydown", onKey)
        }
    }, [mobileOpen, closeMobile])

    return (
        <nav className={navbarStyles.nav}>
            <div className={navbarStyles.navInner}>
                <div className={navbarStyles.logo}>
                    <Link href="/">Alpha Terminal</Link>
                </div>

                {/* Desktop */}
                <div className={navbarStyles.menuList}>
                    <Link href="/" className={menuItemClass("/")}>
                        홈
                    </Link>
                    <Link href="/dashboard" className={menuItemClass("/dashboard")}>
                        대시보드
                    </Link>
                    <Link href="/watchlist" className={menuItemClass("/watchlist")}>
                        관심종목
                    </Link>
                    <Link href="/board" className={menuItemClass("/board")}>
                        게시판
                    </Link>
                    <Link href="/news" className={menuItemClass("/news")}>
                        뉴스
                    </Link>
                    <Link href="/stock-recommendation" className={menuItemClass("/stock-recommendation")}>
                        주식추천
                    </Link>
                    <Link href="/invest" className={menuItemClass("/invest")}>
                        투자판단
                    </Link>
                    <Link href="/youtube" className={menuItemClass("/youtube")}>
                        영상
                    </Link>

                    {!isLoading &&
                        (isLoggedIn ? (
                            <>
                                {state.status === "AUTHENTICATED" && (
                                    <div
                                        className="mr-3 hidden max-w-[14rem] flex-col items-end text-right break-keep md:flex"
                                        aria-label="로그인한 사용자"
                                    >
                                        <span className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
                                            닉네임
                                        </span>
                                        <span className="truncate text-sm font-semibold text-gray-100">
                                            {state.user.nickname}
                                        </span>
                                        {state.user.email ? (
                                            <span
                                                className="truncate text-xs text-gray-500"
                                                title={state.user.email}
                                            >
                                                {state.user.email}
                                            </span>
                                        ) : null}
                                    </div>
                                )}
                                <Link href="/profile" className={navbarStyles.loginButton}>
                                    프로필
                                </Link>
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className={navbarStyles.logoutButton}
                                >
                                    로그아웃
                                </button>
                            </>
                        ) : (
                            <Link href="/login" className={navbarStyles.loginButton}>
                                로그인
                            </Link>
                        ))}
                </div>

                {/* 알림 벨 - 로그인 시 항상 표시 */}
                {isLoggedIn && <NotificationBell />}

                {/* Mobile: 햄버거 또는 로그인 */}
                <div className="flex items-center gap-2 md:hidden">
                    {!isLoading &&
                        (isLoggedIn ? (
                            <button
                                type="button"
                                className={navbarStyles.iconButton}
                                aria-expanded={mobileOpen}
                                aria-controls={panelId}
                                aria-label={mobileOpen ? "메뉴 닫기" : "메뉴 열기"}
                                onClick={() => setMobileOpen((o) => !o)}
                            >
                                <MenuIcon open={mobileOpen} />
                            </button>
                        ) : (
                            <Link href="/login" className={navbarStyles.loginButton}>
                                로그인
                            </Link>
                        ))}
                </div>
            </div>

            {mobileOpen && isLoggedIn && (
                <>
                    <button
                        type="button"
                        className={navbarStyles.overlay}
                        aria-label="메뉴 닫기"
                        onClick={closeMobile}
                    />
                    <div
                        id={panelId}
                        className={navbarStyles.drawer}
                        role="dialog"
                        aria-modal="true"
                        aria-label="내비게이션 메뉴"
                    >
                        <div className={navbarStyles.drawerHeader}>
                            <span className="text-sm font-semibold text-gray-200">메뉴</span>
                            <button
                                type="button"
                                className={navbarStyles.iconButton}
                                aria-label="닫기"
                                onClick={closeMobile}
                            >
                                <MenuIcon open />
                            </button>
                        </div>
                        <div className={navbarStyles.drawerBody}>
                            <Link href="/" className={drawerLinkClass("/")} onClick={closeMobile}>
                                홈
                            </Link>
                            <Link
                                href="/dashboard"
                                className={drawerLinkClass("/dashboard")}
                                onClick={closeMobile}
                            >
                                대시보드
                            </Link>
                            <Link
                                href="/watchlist"
                                className={drawerLinkClass("/watchlist")}
                                onClick={closeMobile}
                            >
                                관심종목
                            </Link>
                            <Link
                                href="/board"
                                className={drawerLinkClass("/board")}
                                onClick={closeMobile}
                            >
                                게시판
                            </Link>
                            <Link
                                href="/news"
                                className={drawerLinkClass("/news")}
                                onClick={closeMobile}
                            >
                                뉴스
                            </Link>
                            <Link
                                href="/stock-recommendation"
                                className={drawerLinkClass("/stock-recommendation")}
                                onClick={closeMobile}
                            >
                                주식추천
                            </Link>
                            <Link
                                href="/invest"
                                className={drawerLinkClass("/invest")}
                                onClick={closeMobile}
                            >
                                투자판단
                            </Link>
                            <Link
                                href="/youtube"
                                className={drawerLinkClass("/youtube")}
                                onClick={closeMobile}
                            >
                                영상
                            </Link>
                            <Link
                                href="/profile"
                                className={drawerLinkClass("/profile")}
                                onClick={closeMobile}
                            >
                                프로필
                            </Link>

                            {state.status === "AUTHENTICATED" && (
                                <div
                                    className="mt-4 border-t border-gray-700 pt-4 break-keep"
                                    aria-label="로그인한 사용자"
                                >
                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                        닉네임
                                    </p>
                                    <p className="truncate text-lg font-semibold text-gray-100">
                                        {state.user.nickname}
                                    </p>
                                    {state.user.email ? (
                                        <p
                                            className="mt-1 truncate text-xs text-gray-500"
                                            title={state.user.email}
                                        >
                                            {state.user.email}
                                        </p>
                                    ) : null}
                                </div>
                            )}
                        </div>
                        <div className={navbarStyles.drawerFooter}>
                            <button
                                type="button"
                                className={`${navbarStyles.logoutButton} w-full`}
                                onClick={handleLogout}
                            >
                                로그아웃
                            </button>
                        </div>
                    </div>
                </>
            )}
        </nav>
    )
}

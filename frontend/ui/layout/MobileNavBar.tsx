"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const NAV_ITEMS = [
    { href: "/", label: "HOME", icon: "home", exact: true },
    { href: "/dashboard", label: "DASH", icon: "show_chart" },
    { href: "/market-feed", label: "FEED", icon: "feed" },
    { href: "/ai-insight", label: "AI", icon: "auto_awesome" },
    { href: "/board", label: "BOARD", icon: "forum" },
    { href: "/my", label: "MY", icon: "person" },
]

export default function MobileNavBar() {
    const pathname = usePathname()

    const isActive = (href: string, exact?: boolean) =>
        exact ? pathname === href : pathname === href || pathname.startsWith(href + "/")

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[9999] flex w-full min-w-0 items-stretch bg-surface-variant border-t-2 border-primary pb-[env(safe-area-inset-bottom,0px)]">
            {NAV_ITEMS.map(({ href, label, icon, exact }) => (
                <Link
                    key={href}
                    href={href}
                    className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-0.5 py-2 font-mono text-[9px] uppercase tracking-wider transition-none max-[360px]:text-[8px] sm:py-2.5 sm:text-[10px] ${
                        isActive(href, exact)
                            ? "text-primary font-bold bg-primary/15 border-t-2 border-primary"
                            : "text-on-surface"
                    }`}
                >
                    <span className="material-symbols-outlined shrink-0 text-[16px] sm:text-[18px]">
                        {icon}
                    </span>
                    <span className="w-full truncate text-center leading-none">{label}</span>
                </Link>
            ))}
        </nav>
    )
}

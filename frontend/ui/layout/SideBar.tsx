"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useIsAdmin } from "@/features/admin/application/hooks/useIsAdmin"

const NAV_GROUPS = [
    {
        items: [
            { href: "/", label: "HOME", icon: "home", exact: true },
        ],
    },
    {
        label: "MARKET_DATA",
        items: [
            { href: "/dashboard", label: "DASHBOARD", icon: "show_chart" },
            { href: "/market-feed", label: "MARKET_FEED", icon: "feed" },
        ],
    },
    {
        label: "AI_INVEST",
        items: [
            { href: "/ai-insight", label: "AI_INSIGHT", icon: "auto_awesome" },
        ],
    },
    {
        items: [
            { href: "/board", label: "BOARD", icon: "forum" },
        ],
    },
]

const SETTINGS_ITEMS = [
    { href: "/my", label: "MY_PAGE", icon: "person" },
]

export default function SideBar() {
    const pathname = usePathname()
    const isAdmin = useIsAdmin()

    const isActive = (href: string, exact?: boolean) =>
        exact ? pathname === href : pathname === href || pathname.startsWith(href + "/")

    const NavLink = ({ href, label, icon, exact }: { href: string; label: string; icon: string; exact?: boolean }) => (
        <Link
            href={href}
            className={`p-2 w-full flex items-center gap-2 font-mono uppercase text-[11px] leading-tight transition-none ${
                isActive(href, exact)
                    ? "bg-primary/15 text-primary font-bold border-l-3 border-primary border-b border-outline-variant/30"
                    : "text-on-surface border-b border-outline-variant/30 hover:bg-surface-container-high"
            }`}
        >
            <span className="material-symbols-outlined text-[14px]">{icon}</span>
            {label}
        </Link>
    )

    return (
        <aside className="hidden md:flex flex-col h-full w-48 bg-surface-container border-r border-outline overflow-y-auto shrink-0">
            <div className="border-b border-outline flex">
                <div className="flex flex-col px-4 py-3 font-mono text-xs">
                    <span className="font-bold text-on-surface uppercase tracking-widest">DATA_CORE</span>
                    <span className="text-[9px] text-tertiary font-bold tracking-widest mt-0.5">SYSTEM_ACTIVE</span>
                </div>
            </div>

            <nav className="flex-1">
                {NAV_GROUPS.map((group, i) => (
                    <div key={i}>
                        {i > 0 && (
                            <div className="flex items-center gap-1 px-2 pt-2 pb-1">
                                {group.label && (
                                    <span className="font-mono text-[8px] text-on-surface-variant/60 tracking-widest uppercase">
                                        {group.label}
                                    </span>
                                )}
                                <div className="flex-1 border-t border-outline-variant/40" />
                            </div>
                        )}
                        {group.items.map(({ href, label, icon, ...rest }) => (
                            <NavLink key={href} href={href} label={label} icon={icon} exact={"exact" in rest ? rest.exact : undefined} />
                        ))}
                    </div>
                ))}
            </nav>

            <div className="border-t border-outline">
                {SETTINGS_ITEMS.map(({ href, label, icon }) => (
                    <NavLink key={href} href={href} label={label} icon={icon} />
                ))}
                {isAdmin && (
                    <NavLink href="/admin" label="ADMIN" icon="admin_panel_settings" />
                )}
            </div>

            <div className="p-3 pb-8 border-t border-outline font-mono text-[9px] text-on-surface-variant leading-relaxed">
                <div>UPTIME: 99.99%</div>
                <div>LOC: SEOUL_HQ</div>
            </div>
        </aside>
    )
}

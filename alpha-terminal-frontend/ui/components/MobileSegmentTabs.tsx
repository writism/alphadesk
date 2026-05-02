"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

interface Tab {
    href: string
    label: string
}

interface MobileSegmentTabsProps {
    tabs: Tab[]
}

export default function MobileSegmentTabs({ tabs }: MobileSegmentTabsProps) {
    const pathname = usePathname()

    return (
        <nav className="md:hidden flex border-b border-outline-variant bg-surface-container">
            {tabs.map(({ href, label }) => {
                const isActive = pathname === href || pathname.startsWith(href + "/")
                return (
                    <Link
                        key={href}
                        href={href}
                        className={`flex-1 py-2.5 text-center font-mono text-[11px] uppercase tracking-widest transition-none ${
                            isActive
                                ? "text-primary font-bold border-b-2 border-primary"
                                : "text-on-surface-variant hover:text-on-surface"
                        }`}
                    >
                        {label}
                    </Link>
                )
            })}
        </nav>
    )
}

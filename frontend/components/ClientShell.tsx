"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import TopBar from "@/ui/layout/TopBar"
import SideBar from "@/ui/layout/SideBar"
import StatusFooter from "@/ui/layout/StatusFooter"
import MobileNavBar from "@/ui/layout/MobileNavBar"

export default function ClientShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const mainRef = useRef<HTMLElement>(null)

    useEffect(() => {
        mainRef.current?.scrollTo({ top: 0 })
    }, [pathname])

    return (
        <>
            <TopBar />
            <div className="flex mt-10 h-[calc(100vh-64px)]">
                <SideBar />
                <main ref={mainRef} className="flex-1 min-h-0 overflow-y-auto pb-24 md:pb-4">
                    {children}
                </main>
            </div>
            <StatusFooter />
            <MobileNavBar />
        </>
    )
}

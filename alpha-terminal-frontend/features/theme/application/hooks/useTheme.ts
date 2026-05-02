"use client"

import { useAtom } from "jotai"
import { useCallback, useEffect, useRef } from "react"
import { themeAtom, type Theme } from "../atoms/themeAtom"

const STORAGE_KEY = "alpha-terminal-theme"

export function useTheme() {
    const [theme, setTheme] = useAtom(themeAtom)
    const initialized = useRef(false)

    useEffect(() => {
        if (initialized.current) return
        initialized.current = true
        const saved = localStorage.getItem(STORAGE_KEY) as Theme | null
        if (saved === "light" || saved === "dark") {
            setTheme(saved)
        }
    }, [setTheme])

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme)
        localStorage.setItem(STORAGE_KEY, theme)
    }, [theme])

    const toggle = useCallback(() => {
        setTheme((prev) => (prev === "dark" ? "light" : "dark"))
    }, [setTheme])

    return { theme, toggle }
}

import { Suspense } from "react"
import { LoginContent } from "./login-content"

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-full">
            <span className="font-mono text-[11px] text-on-surface-variant uppercase tracking-widest animate-pulse">
                AUTH_VERIFY...
            </span>
        </div>}>
            <LoginContent />
        </Suspense>
    )
}

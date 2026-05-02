"use client"

import { useEffect } from "react"

interface Props {
    error: Error & { digest?: string }
    reset: () => void
}

export default function GlobalError({ error, reset }: Props) {
    useEffect(() => {
        console.error("[GlobalError]", error)
    }, [error])

    return (
        <html>
            <body>
                <main className="flex min-h-screen items-center justify-center bg-surface text-on-surface">
                    <div className="border border-error px-8 py-10 font-mono text-center">
                        <div className="mb-4 text-xs font-bold text-error uppercase tracking-widest">
                            [FATAL_ERROR]
                        </div>
                        <p className="mb-6 text-sm text-on-surface-variant">
                            레이아웃 오류가 발생했습니다.
                        </p>
                        {error.digest && (
                            <p className="mb-6 text-[10px] text-outline">
                                ERR_ID: {error.digest}
                            </p>
                        )}
                        <button
                            type="button"
                            onClick={reset}
                            className="border border-primary px-4 py-2 text-xs font-bold text-primary uppercase hover:bg-primary hover:text-white"
                        >
                            RELOAD
                        </button>
                    </div>
                </main>
            </body>
        </html>
    )
}

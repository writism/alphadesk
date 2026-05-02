import type { Metadata } from "next"
import { Space_Grotesk, IBM_Plex_Mono, Inter } from "next/font/google"
import "./globals.css"
import JotaiProvider from "@/components/JotaiProvider"
import AuthProvider from "@/components/AuthProvider"
import ClientShell from "@/components/ClientShell"
import SWRProvider from "@/components/SWRProvider"
import { KakaoSDKLoader } from "@/features/share/ui/components/KakaoSDKLoader"

const spaceGrotesk = Space_Grotesk({
    variable: "--font-space-grotesk",
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700"],
})

const ibmPlexMono = IBM_Plex_Mono({
    variable: "--font-ibm-plex-mono",
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
})

const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
})

export const metadata: Metadata = {
    title: "ALPHA_TERMINAL | TERMINAL_V1.0",
    description: "AI 기반 주식 분석 워크스테이션",
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="ko" className="h-full overflow-hidden" suppressHydrationWarning>
            <head>
                <link
                    rel="stylesheet"
                    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
                />
                <script
                    dangerouslySetInnerHTML={{
                        __html: `(function(){var t=localStorage.getItem("alpha-terminal-theme");document.documentElement.setAttribute("data-theme",t==="light"?"light":"dark")})()`,
                    }}
                />
            </head>
            <body className={`${spaceGrotesk.variable} ${ibmPlexMono.variable} ${inter.variable} h-full overflow-hidden`}>
                <SWRProvider>
                    <JotaiProvider>
                        <AuthProvider>
                            <KakaoSDKLoader />
                            <ClientShell>
                                {children}
                            </ClientShell>
                        </AuthProvider>
                    </JotaiProvider>
                </SWRProvider>
            </body>
        </html>
    )
}

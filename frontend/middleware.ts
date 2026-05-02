import { NextRequest, NextResponse } from "next/server"

export function middleware(request: NextRequest) {
    const nickname = request.cookies.get("nickname")
    if (!nickname) {
        return NextResponse.redirect(new URL("/login", request.url))
    }
    return NextResponse.next()
}

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/watchlist/:path*",
        "/my/:path*",
        "/board/:path*",
        "/ai-insight/:path*",
        "/admin/:path*",
    ],
}

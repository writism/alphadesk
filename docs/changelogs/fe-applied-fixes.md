# FIXLIST FE 적용 결과 (2026-03-21)

> `/Users/sulee/dev/codelab/FIXLIST.md` P0·P1·P2 항목 중 FE 적용 가능 항목 처리 결과.

---

## 적용 완료

### [FE-01] jotai package.json 미등록 (P0)

**조치**: `npm install jotai`

```json
// package.json dependencies
"jotai": "^2.18.1"
```

---

### [FE-02] Jotai `<Provider>` 미설정 (P0)

**파일**: `app/layout.tsx`

```tsx
import { Provider } from "jotai"

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body ...>
        <Provider>
          <AppLayout>{children}</AppLayout>
        </Provider>
      </body>
    </html>
  )
}
```

---

### [FE-03] HTTP 클라이언트 에러 처리 없음 (P0)

**파일**: `infrastructure/http/httpClient.ts`

4xx/5xx 응답이 성공으로 처리되던 문제 수정. `res.ok` 체크 후 `Error` throw.

```typescript
export const httpClient = {
  get: async (path: string) => {
    const res = await fetch(...)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res
  },
  post: async (path: string, body?: unknown) => {
    const res = await fetch(...)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res
  },
}
```

---

### [FE-05] `registerUser()` 타입 unsafe (P1)

**파일**: `features/auth/infrastructure/api/authApi.ts`

`(error as any).status` 패턴 제거. `ApiError` 클래스 도입.

```typescript
export class ApiError extends Error {
    constructor(public status: number, message: string) {
        super(message)
        this.name = "ApiError"
    }
}

export async function registerUser(...): Promise<void> {
    ...
    if (!res.ok && !res.redirected) {
        throw new ApiError(res.status, "Registration failed")
    }
}
```

**파일**: `features/auth/application/hooks/useSignup.ts`

```typescript
import { registerUser, ApiError } from "../../infrastructure/api/authApi"

// 변경 전
const status = (err as any).status

// 변경 후
const status = err instanceof ApiError ? err.status : undefined
```

---

### [FE-06] 보호된 라우트 미구현 (P1)

**파일**: `middleware.ts` (신규, 프로젝트 루트)

미인증 사용자가 `/dashboard`, `/watchlist`에 직접 접근 시 `/login`으로 redirect.

```typescript
import { NextRequest, NextResponse } from "next/server"

export function middleware(request: NextRequest) {
    const nickname = request.cookies.get("nickname")
    if (!nickname) {
        return NextResponse.redirect(new URL("/login", request.url))
    }
}

export const config = {
    matcher: ["/dashboard", "/watchlist"],
}
```

---

### [FE-09] `PENDING_TERMS` 상태 Navbar 미처리 (P2)

**파일**: `ui/layout/Navbar.tsx`

약관 동의 진행 중 로그인 버튼이 표시되던 문제 수정.

```typescript
// 변경 전
const isLoading = state.status === "LOADING"

// 변경 후
const isLoading = state.status === "LOADING" || state.status === "PENDING_TERMS"
```

---

## 미적용 항목

| 항목 | 이유 |
|------|------|
| **FE-10** (email URL 노출) | 백엔드 변경 필요 — ISSUE-01 문서 참조 |
| **FE-11** (LOADING 초기값 검토) | P3 선택적 개선 |
| **FE-12** (isLoggedInAtom 미사용) | P3 선택적 개선 |

---

## 검증

```bash
npx tsc --noEmit  # 타입 오류 없음
```

# Vercel + Railway 배포를 위한 소스 변경 내역

> 작성일: 2026-04-04
> 배포 결과: Vercel(프론트) + Railway(백엔드/DB/Cache) 배포 완료

---

## 변경 파일 목록

| 파일 | 구분 | 변경 유형 |
|------|------|----------|
| `alpha-desk-ai-server/main.py` | 백엔드 | 수정 |
| `alpha-desk-ai-server/requirements.txt` | 백엔드 | 수정 |
| `alpha-desk-frontend/next.config.ts` | 프론트 | 수정 |
| `alpha-desk-frontend/app/api/[...path]/route.ts` | 프론트 | 신규 생성 |
| `alpha-desk-frontend/app/api/pipeline/run-stream/route.ts` | 프론트 | 수정 |
| `alpha-desk-frontend/app/weblogin/create_account/page.tsx` | 프론트 | 신규 생성 |

---

## 백엔드 변경

### 1. `alpha-desk-ai-server/main.py`

**변경 내용:** 포트 하드코딩 → 환경변수 사용

```python
# Before
uvicorn.run(app, host="0.0.0.0", port=33333)

# After
uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 33333)))
```

**이유:** Railway는 배포 시 `PORT` 환경변수를 자동 주입한다. 하드코딩된 33333이 아닌 Railway가 지정한 포트(8080)로 서버가 떠야 외부에서 접근 가능하다.

---

### 2. `alpha-desk-ai-server/requirements.txt`

**변경 내용:** `cryptography` 패키지 추가

```
# Before
pymysql>=1.1.0

# After
pymysql>=1.1.0
cryptography>=42.0.0
```

**이유:** Railway MySQL 8은 `caching_sha2_password` 인증 방식을 사용한다. PyMySQL이 이 방식으로 연결하려면 `cryptography` 패키지가 반드시 필요하다. 없으면 아래 에러 발생:
```
RuntimeError: 'cryptography' package is required for sha256_password or caching_sha2_password auth methods
```

---

## 프론트엔드 변경

### 3. `alpha-desk-frontend/next.config.ts`

**변경 내용:** `rewrites()` 백엔드 프록시 제거

```typescript
// Before
const nextConfig: NextConfig = {
  async rewrites() {
    return [{ source: "/api/:path*", destination: "http://localhost:33333/:path*" }]
  }
}

// After
const nextConfig: NextConfig = {
  devIndicators: false,
}
```

**이유:** Vercel Edge Network는 Railway URL(외부 HTTPS 도메인)을 내부 IP로 resolve하면서 `DNS_HOSTNAME_RESOLVED_PRIVATE` 오류로 차단한다. `rewrites()`는 Edge에서 실행되므로 사용 불가. 대신 Node.js 런타임에서 실행되는 Route Handler로 대체했다.

---

### 4. `alpha-desk-frontend/app/api/[...path]/route.ts` (신규)

**역할:** `/api/*` 모든 요청을 Railway 백엔드로 프록시하는 catch-all Route Handler

```typescript
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";   // Edge 아님 → Railway URL 접근 가능
export const maxDuration = 60;     // SSE 스트리밍 최대 60초

async function handler(request, context) {
  const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:33333";
  // 요청 헤더 전달 (cookie, content-type, authorization, accept)
  // 리다이렉트 응답은 브라우저로 직접 전달 (Kakao OAuth 플로우)
  // Set-Cookie 헤더 전달 (vercel.app 도메인에 쿠키 설정)
}
```

**핵심 포인트:**
- `redirect: "manual"` : Railway가 Kakao로 리다이렉트할 때 fetch가 따라가지 않고 브라우저에 그대로 전달
- `Set-Cookie` 전달 : 로그인 쿠키가 Railway 도메인이 아닌 vercel.app 도메인에 설정됨
- `runtime = "nodejs"` : Edge 런타임은 Railway private IP 차단 문제가 있어 Node.js 사용

---

### 5. `alpha-desk-frontend/app/api/pipeline/run-stream/route.ts` (수정)

**변경 내용:** 잘못된 환경변수명 수정 + 런타임 설정 추가

```typescript
// Before
const BACKEND_URL = process.env.BACKEND_INTERNAL_URL ?? "http://localhost:33333"
// → BACKEND_INTERNAL_URL이 Vercel에 없어서 항상 localhost:33333 사용

// After
export const runtime = "nodejs"
export const maxDuration = 60

export async function POST(req) {
  const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:33333"
  // → Vercel에 설정된 BACKEND_URL 사용
```

**이유:** 이것이 진짜 원인이었다. Next.js는 구체적인 경로(`/api/pipeline/run-stream/route.ts`)가 catch-all(`[...path]/route.ts`)보다 우선순위가 높다. 즉, run-stream 요청은 내가 수정한 catch-all이 아닌 이 파일로 처리되고 있었다. 그런데 이 파일이 `BACKEND_INTERNAL_URL`(존재하지 않는 env var)을 읽어서 항상 `localhost:33333`에 연결 시도 → `ECONNREFUSED`.

---

### 6. `alpha-desk-frontend/app/weblogin/create_account/page.tsx` (신규)

**역할:** 카카오 간편가입 플로우에서 발생하는 404 해결

```typescript
"use client";
// /weblogin/create_account?continue=<kakao-auth-url> 로 리다이렉트 되면
// continue 파라미터의 URL로 자동 이동
function KakaoRedirect() {
  const searchParams = useSearchParams();
  useEffect(() => {
    const continueUrl = searchParams.get("continue");
    if (continueUrl) window.location.href = continueUrl;
  }, [searchParams]);
}
```

**이유:** 카카오 간편가입 시 `POST /weblogin/create_account?continue=<kakao-url>` 로 리다이렉트 되는데, 이 경로에 해당하는 Next.js 페이지가 없어서 404가 발생했다. 페이지를 만들어 `continue` 파라미터의 카카오 인증 URL로 자동 이동시킨다.

---

## 트러블슈팅 핵심 요약

| 문제 | 원인 | 해결 |
|------|------|------|
| Railway 서버 시작 안 됨 | 포트 33333 하드코딩, Railway는 8080 주입 | `os.getenv("PORT", 33333)` |
| MySQL 연결 실패 | `caching_sha2_password` 인증, cryptography 없음 | `cryptography>=42.0.0` 추가 |
| 프록시 DNS 차단 | Vercel Edge가 Railway URL을 private IP로 차단 | `next.config.ts` rewrites 제거, Route Handler로 대체 |
| 카카오 로그인 후 쿠키 없음 | Railway 도메인에 쿠키 설정 → Vercel에서 안 읽힘 | `Set-Cookie` 헤더 프록시로 전달 |
| 간편가입 404 | `/weblogin/create_account` 페이지 없음 | 페이지 신규 생성 |
| RUN_ANALYSIS 500 | 전용 route handler가 `BACKEND_INTERNAL_URL`(미존재) 읽음 | `BACKEND_URL`로 수정 |

---

## 로컬 개발 — 변경 없음

로컬에서는 기존과 동일하게 동작한다.

```bash
# 백엔드
cd alpha-desk-ai-server
source .venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 33333

# 프론트
cd alpha-desk-frontend
npm run dev
# BACKEND_URL 미설정 → localhost:33333 fallback 자동 적용
```

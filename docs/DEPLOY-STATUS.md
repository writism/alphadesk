# Alpha Desk 배포 현황 및 트러블슈팅

> 작성일: 2026-04-04

---

## 1. 배포 아키텍처

```
브라우저
  │
  │ HTTPS
  ▼
Vercel (프론트엔드)
  https://alpha-desk-frontend.vercel.app
  - Next.js 16 App Router
  - app/api/[...path]/route.ts 가 모든 /api/* 요청을 Railway로 프록시
  │
  │ HTTPS (서버→서버)
  ▼
Railway (백엔드)
  https://alpha-desk-ai-server-production.up.railway.app  (Port 8080)
  - FastAPI (Python)
  - MySQL (Railway 내부)
  - Redis (Railway 내부)
```

---

## 2. 백엔드 (Railway)

| 항목 | 내용 |
|------|------|
| 플랫폼 | Railway Hobby |
| 서비스 | alpha-desk-ai-server |
| 퍼블릭 도메인 | alpha-desk-ai-server-production.up.railway.app |
| 포트 | 8080 (Railway `PORT` env = 8080) |
| 진입점 | `uvicorn main:app --host 0.0.0.0 --port $PORT` |
| DB | Railway MySQL (내부 네트워크) |
| Cache | Railway Redis (내부 네트워크) |
| 소스 | GitHub → writism/alpha-desk-ai-server → main 브랜치 자동 배포 |

### 백엔드 환경변수 (Railway Variables)

```
PORT=8080
MYSQL_HOST=${{MySQL.MYSQLHOST}}
MYSQL_PORT=${{MySQL.MYSQLPORT}}
MYSQL_USER=${{MySQL.MYSQLUSER}}
MYSQL_PASSWORD=${{MySQL.MYSQLPASSWORD}}
MYSQL_DATABASE=${{MySQL.MYSQLDATABASE}}
REDIS_HOST=${{Redis.REDISHOST}}
REDIS_PORT=${{Redis.REDISPORT}}
REDIS_PASSWORD=${{Redis.REDISPASSWORD}}
DEBUG=false
AUTH_SECRET=<설정됨>
AUTH_PASSWORD=<설정됨>
OPENAI_API_KEY=<설정됨>
OPENAI_MODEL=gpt-4.1-mini
KAKAO_CLIENT_ID=<설정됨>
KAKAO_CLIENT_SECRET=<설정됨>
KAKAO_REDIRECT_URI=https://alpha-desk-frontend.vercel.app/api/kakao-authentication/request-access-token-after-redirection
CORS_ALLOWED_FRONTEND_URL=https://alpha-desk-frontend.vercel.app
FRONTEND_AUTH_CALLBACK_URL=https://alpha-desk-frontend.vercel.app/auth-callback
DART_API_KEY=<설정됨>
FINNHUB_API_KEY=<설정됨>
SERP_API_KEY=<설정됨>
YOUTUBE_API_KEY=<설정됨>
TWELVE_DATA_API_KEY=<설정됨>
```

### 백엔드 동작 확인 (정상)

- `GET /` → `{"message": "Hello World"}` ✅
- `GET /docs` → Swagger UI ✅
- 카카오 OAuth 콜백 처리 ✅
- SSE 스트리밍 (`/pipeline/run-stream`) Railway 직접 호출 시 ✅

---

## 3. 프론트엔드 (Vercel)

| 항목 | 내용 |
|------|------|
| 플랫폼 | Vercel Hobby |
| 도메인 | alpha-desk-frontend.vercel.app |
| 프레임워크 | Next.js 16 App Router |
| 소스 | GitHub → writism/alpha-desk-frontend → main 브랜치 자동 배포 |
| 런타임 | Node.js (Edge 아님) |

### 프론트엔드 환경변수 (Vercel Settings → Environment Variables)

```
BACKEND_URL=https://alpha-desk-ai-server-production.up.railway.app   ← All Environments
NEXT_PUBLIC_API_BASE_URL=/api
NEXT_PUBLIC_KAKAO_LOGIN_PATH=/kakao-authentication/request-oauth-link
NEXT_PUBLIC_KAKAO_JS_KEY=<설정됨>
NEXT_PUBLIC_SHARE_BASE_URL=https://alpha-desk-frontend.vercel.app
```

### 주요 파일 변경 이력

#### `next.config.ts`
- 기존: `rewrites()`로 백엔드 프록시 (localhost:33333 하드코딩)
- 변경: rewrites 제거, Route Handler로 대체
- 이유: Vercel Edge에서 Railway URL이 private IP로 차단됨 (`DNS_HOSTNAME_RESOLVED_PRIVATE`)

#### `app/api/[...path]/route.ts` (신규 생성)
- 역할: 모든 `/api/*` 요청을 BACKEND_URL로 프록시
- `runtime = "nodejs"` (Edge 아님)
- `maxDuration = 60` (SSE 타임아웃 대응)
- `redirect: "manual"` (Kakao OAuth 리다이렉트 직접 처리)
- Set-Cookie 헤더 전달 (쿠키 vercel.app 도메인에 설정)

#### `app/weblogin/create_account/page.tsx` (신규 생성)
- Kakao 간편가입 플로우 `/weblogin/create_account?continue=<url>` → 404 해결

---

## 4. 동작 확인된 기능

| 기능 | 상태 |
|------|------|
| 카카오 로그인 | ✅ 정상 |
| 대시보드 접근 | ✅ 정상 |
| 관심종목 검색/등록 | ✅ 정상 (종목 데이터 3,951개 마이그레이션 완료) |
| AI 뉴스 분석 요약 조회 (`/pipeline/summaries`) | ✅ 정상 |
| **RUN_ANALYSIS (AI 분석 실행)** | ❌ 500 에러 |

---

## 5. 현재 미해결 문제

### 증상
```
POST https://alpha-desk-frontend.vercel.app/api/pipeline/run-stream
→ HTTP 500 Internal Server Error
```

### Vercel 함수 로그
```
TypeError: fetch failed
[cause]: Error: connect ECONNREFUSED 127.0.0.1:33333
  errno: -111,
  code: 'ECONNREFUSED',
  syscall: 'connect',
  address: '127.0.0.1',
  port: 33333
```

### 의미
Route Handler가 Railway URL 대신 `localhost:33333`으로 연결 시도 중.
→ `process.env.BACKEND_URL`이 런타임에 `undefined` 또는 빈 문자열로 평가되고 있음.

---

## 6. 원인 분석 및 시도한 해결책

### 시도 1: maxDuration, runtime 추가
```typescript
export const runtime = "nodejs";
export const maxDuration = 60;
```
- 결과: 변화 없음

### 시도 2: accept 헤더 전달
- 결과: 변화 없음

### 시도 3: fetch 에러 try-catch → 502 반환 + 로깅
- 결과: 여전히 500 (502가 아님) → **내 try-catch가 실행조차 안 되고 있음**
- 추가 분석: Vercel 로그에 `[proxy] BACKEND_URL: ...` 로그가 없음 → 핸들러 자체가 실행 안 되고 있을 가능성

### 시도 4: BACKEND_URL을 모듈 레벨 → 함수 내부로 이동
```typescript
// Before (모듈 레벨 - 빌드 타임 평가 가능성)
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:33333";

// After (런타임 강제)
async function handler(...) {
  const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:33333";
```
- 결과: 변화 없음

### 시도 5: Vercel Redeploy 반복
- BACKEND_URL 업데이트 후 여러 차례 Redeploy
- 결과: 동일한 청크 해시(`20351e4a`)로 계속 배포됨 → 빌드 캐시 재사용 의심

---

## 7. 가장 유력한 원인

### 가설 A: 빌드 캐시 문제
- Vercel이 동일한 청크(`[root-of-the-server]__20351e4a`)를 계속 재사용
- BACKEND_URL이 빌드 타임에 `undefined`로 인라인됨
- 코드 변경을 했지만 캐시된 버전이 서빙되고 있을 가능성

### 가설 B: 환경변수 스코프 문제
- BACKEND_URL이 "All Environments"로 표시되지만 실제로 Production 함수에 주입되지 않는 Vercel 내부 버그

### 가설 C: Route Handler 자체가 실행 안 됨
- `[proxy] BACKEND_URL:` 로그가 한 번도 안 나타남
- 다른 API들(`/api/pipeline/summaries`, `/api/watchlist` 등)은 200으로 성공 중
- `run-stream`만 특이하게 실패 → 다른 원인 가능성

---

## 8. 미확인 사항 / 다음 시도 방향

### 확인 필요
1. Vercel 로그에서 `[proxy] BACKEND_URL:` 로그가 찍히는지 (최신 배포 후)
2. 다른 API (`/api/pipeline/summaries`)의 Vercel 로그에서 `[proxy] BACKEND_URL:` 확인
3. `curl -X POST https://alpha-desk-frontend.vercel.app/api/pipeline/run-stream` 로 직접 테스트

### 대안 시도 방법
1. **Vercel CLI로 강제 재빌드**:
   ```bash
   npx vercel --prod --force
   ```
2. **NEXT_PUBLIC_ 변수로 우회** (서버에서만 사용하므로 보안상 문제 있음, 임시 테스트용):
   ```
   NEXT_PUBLIC_BACKEND_URL=https://alpha-desk-ai-server-production.up.railway.app
   ```
3. **Railway 대신 Vercel에 백엔드도 배포** (근본적 구조 변경)
4. **Next.js API Route 대신 별도 프록시 서버 사용**

---

## 9. 로컬 개발 환경 (정상 동작)

```
백엔드: uvicorn main:app --reload --host 0.0.0.0 --port 33333
프론트: npm run dev (BACKEND_URL 미설정 → localhost:33333 fallback)
```

로컬 `.env` (백엔드):
```
MYSQL_HOST=localhost / MYSQL_PORT=3306 / MYSQL_USER=eddi
REDIS_HOST=localhost / REDIS_PORT=6379
OPENAI_MODEL=gpt-5-mini  ← 주의: 실제 존재하는 모델명 확인 필요
AUTH_SECRET=alpha-desk-secret  ← 프로덕션용은 32자 이상 랜덤 문자열로 변경됨
```

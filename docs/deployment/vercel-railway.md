# Vercel + Railway 배포 가이드

> Alpha Desk: Next.js 프론트엔드 → Vercel / FastAPI 백엔드 → Railway

---

## 사전 준비

- GitHub 계정 (백엔드/프론트엔드 각각 repo push 필요)
- [railway.app](https://railway.app) 계정 (GitHub 로그인 권장)
- [vercel.com](https://vercel.com) 계정 (GitHub 로그인 권장)

---

## 1단계: 백엔드 GitHub Push

```bash
cd alpha-desk-ai-server
git init   # 아직 git이 없다면
git remote add origin https://github.com/<username>/alpha-desk-ai-server.git
git add .
git commit -m "initial commit"
git push -u origin main
```

---

## 2단계: Railway — 프로젝트 생성

1. [railway.app/new](https://railway.app/new) 접속
2. **Deploy from GitHub repo** 선택
3. `alpha-desk-ai-server` repo 선택 → Deploy
4. Railway가 Python 자동 감지 → uvicorn으로 시작함

> Railway는 `$PORT` 환경변수를 자동으로 주입하고, `uvicorn main:app --host 0.0.0.0 --port $PORT`로 시작함.
> `PORT`를 직접 설정하지 말 것.

---

## 3단계: Railway — MySQL 추가

1. 프로젝트 캔버스에서 **+ New** → **Database** → **MySQL** 클릭
2. MySQL 서비스 자동 생성됨
3. MySQL 서비스 클릭 → **Variables** 탭 → 필요한 변수 확인:
   - `MYSQLHOST`, `MYSQLPORT`, `MYSQLUSER`, `MYSQLPASSWORD`, `MYSQLDATABASE`

---

## 4단계: Railway — Redis 추가

1. 프로젝트 캔버스에서 **+ New** → **Database** → **Redis** 클릭
2. Redis 서비스 자동 생성됨
3. Redis 서비스 클릭 → **Variables** 탭 → 확인:
   - `REDISHOST`, `REDISPORT`, `REDISPASSWORD`

---

## 5단계: Railway — 백엔드 환경변수 설정

백엔드 서비스(alpha-desk-ai-server) 클릭 → **Variables** 탭 → 아래 변수 입력

### MySQL 연결 (Railway 내부 참조 변수 사용)
```
MYSQL_HOST=${{MySQL.MYSQLHOST}}
MYSQL_PORT=${{MySQL.MYSQLPORT}}
MYSQL_USER=${{MySQL.MYSQLUSER}}
MYSQL_PASSWORD=${{MySQL.MYSQLPASSWORD}}
MYSQL_DATABASE=${{MySQL.MYSQLDATABASE}}
```
> `${{MySQL.MYSQLHOST}}` 형태가 Railway 참조 변수 문법. MySQL 서비스명이 다르면 바꿔서 입력.

### Redis 연결
```
REDIS_HOST=${{Redis.REDISHOST}}
REDIS_PORT=${{Redis.REDISPORT}}
REDIS_PASSWORD=${{Redis.REDISPASSWORD}}
```

### 앱 설정
```
DEBUG=false
AUTH_SECRET=<랜덤 문자열 32자 이상>
AUTH_PASSWORD=<랜덤 문자열 32자 이상>
OPENAI_API_KEY=<OpenAI 키>
OPENAI_MODEL=gpt-4.1-mini
OPENAI_RESPONSES_MODEL=gpt-4.1-mini
OPENAI_RECOMMENDATION_REASON_MODEL=gpt-5-mini
KAKAO_CLIENT_ID=<카카오 앱 키>
KAKAO_CLIENT_SECRET=<카카오 시크릿>
KAKAO_REDIRECT_URI=https://<railway-domain>/kakao-authentication/callback
CORS_ALLOWED_FRONTEND_URL=https://<vercel-domain>.vercel.app
FRONTEND_AUTH_CALLBACK_URL=https://<vercel-domain>.vercel.app/auth-callback
DART_API_KEY=<DART 키>
FINNHUB_API_KEY=<Finnhub 키>
SERP_API_KEY=<SerpAPI 키>
```

> `<railway-domain>`은 6단계에서 생성 후 채워넣기.
> `<vercel-domain>`은 8단계에서 생성 후 채워넣기.

---

## 6단계: Railway — 백엔드 퍼블릭 도메인 생성

1. 백엔드 서비스 → **Settings** → **Networking** → **Generate Domain** 클릭
2. 생성된 URL 복사: `https://alpha-desk-ai-server-xxxx.up.railway.app`
3. 이 URL을 5단계의 `KAKAO_REDIRECT_URI`와 `CORS_ALLOWED_FRONTEND_URL` 값으로 업데이트

---

## 7단계: 프론트엔드 GitHub Push

```bash
cd alpha-desk-frontend
git init   # 아직 git이 없다면
git remote add origin https://github.com/<username>/alpha-desk-frontend.git
git add .
git commit -m "initial commit"
git push -u origin main
```

---

## 8단계: Vercel — 프론트엔드 배포

1. [vercel.com/new](https://vercel.com/new) 접속
2. **Import from GitHub** → `alpha-desk-frontend` 선택
3. Framework: Next.js 자동 감지됨
4. **Environment Variables** 에 아래 입력:

```
BACKEND_URL=https://alpha-desk-ai-server-xxxx.up.railway.app
NEXT_PUBLIC_API_BASE_URL=/api
NEXT_PUBLIC_KAKAO_LOGIN_PATH=/kakao-authentication/request-oauth-link
NEXT_PUBLIC_KAKAO_JS_KEY=<카카오 JS 키>
NEXT_PUBLIC_SHARE_BASE_URL=https://<vercel-domain>.vercel.app
```

> `BACKEND_URL`은 서버사이드에서만 사용 (브라우저에 노출 안 됨)
> `NEXT_PUBLIC_*`은 빌드 타임에 번들에 포함됨 — 변경 시 재배포 필요

5. **Deploy** 클릭
6. 생성된 Vercel URL 복사

---

## 9단계: 카카오 개발자 설정 업데이트

[developers.kakao.com](https://developers.kakao.com) → 내 앱 → 플랫폼 설정:

- **Redirect URI 추가**: `https://<railway-domain>.up.railway.app/kakao-authentication/callback`
- **Web 플랫폼 도메인 추가**: `https://<vercel-domain>.vercel.app`

---

## 10단계: 최종 환경변수 업데이트

Railway 백엔드 Variables 탭에서:
```
CORS_ALLOWED_FRONTEND_URL=https://<실제 vercel 도메인>.vercel.app
FRONTEND_AUTH_CALLBACK_URL=https://<실제 vercel 도메인>.vercel.app/auth-callback
```

Vercel 프론트엔드 Settings → Environment Variables 에서:
```
NEXT_PUBLIC_SHARE_BASE_URL=https://<실제 vercel 도메인>.vercel.app
```

환경변수 변경 후 → Vercel 대시보드에서 **Redeploy** 클릭

---

## 배포 후 확인 체크리스트

- [ ] `https://<railway-domain>.up.railway.app/` → `{"message": "Hello World"}` 응답
- [ ] `https://<railway-domain>.up.railway.app/docs` → FastAPI Swagger UI 접근 가능
- [ ] `https://<vercel-domain>.vercel.app` → 프론트엔드 정상 로딩
- [ ] 카카오 로그인 → 로그인 후 `/auth-callback` 리다이렉트 정상
- [ ] 관심종목 추가/조회 동작 확인

---

## 코드 변경 사항 요약

배포를 위해 수정된 파일:

### `alpha-desk-frontend/next.config.ts`
```ts
// 변경 전: "http://localhost:33333/:path*" 하드코딩
// 변경 후: BACKEND_URL 환경변수 사용
const backendUrl = process.env.BACKEND_URL || "http://localhost:33333";
```

### `alpha-desk-ai-server/main.py`
```python
# 변경 전: port=33333 하드코딩
# 변경 후: PORT 환경변수 사용 (Railway가 자동 주입)
port=int(os.getenv("PORT", 33333))
```

---

## 로컬 개발은 그대로

로컬에서는 기존과 동일하게 작동:
- 백엔드: `uvicorn main:app --reload --host 0.0.0.0 --port 33333`
- 프론트: `npm run dev` (BACKEND_URL 미설정 → localhost:33333 fallback)

---

## 비용 참고

| 서비스 | 무료 한도 | 초과 시 |
|--------|----------|---------|
| Railway Hobby | $5/월 크레딧 | 사용량 기반 과금 |
| Railway MySQL | 크레딧 안에서 | 사용량 기반 |
| Railway Redis | 크레딧 안에서 | 사용량 기반 |
| Vercel | 무료 (개인 프로젝트) | Pro $20/월 |

소규모 트래픽 기준 Railway $5 크레딧으로 충분히 커버 가능.

---

## 커스텀 도메인 (선택)

### Vercel
1. Project → Settings → Domains → 도메인 입력
2. DNS: `A 레코드 → 76.76.21.21` 또는 `CNAME → cname.vercel-dns.com`

### Railway
1. 서비스 → Settings → Networking → Custom Domain
2. DNS: `CNAME → <railway-cname>.up.railway.app`
3. SSL 자동 발급 (Let's Encrypt)

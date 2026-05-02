# ISSUE-01: temp_token HttpOnly 쿠키 감지 불가 문제

## 현상

`/auth-callback` 페이지에서 신규 회원을 감지하지 못하고 `/terms` 대신 `/`로 리다이렉트된다.

## 원인

### 1. 백엔드가 temp_token을 HttpOnly 쿠키로 세팅

백엔드가 신규 회원 카카오 로그인 처리 후 `temp_token`을 **HttpOnly** 속성으로 세팅한다.

```
Set-Cookie: temp_token=xxxx-xxxx; HttpOnly; Path=/
```

HttpOnly 쿠키는 보안상 JavaScript에서 `document.cookie`로 읽을 수 없다.

### 2. 프론트 구현이 document.cookie 기반

초기 구현의 `detectAuthState()`가 `getCookie("temp_token")`으로 신규 회원을 판별했다.

```ts
// 동작 안 함 — temp_token이 HttpOnly라 항상 null 반환
if (getCookie("temp_token")) return { status: "PENDING_TERMS" }
```

### 3. 대체 API 없음

| 엔드포인트 | 결과 | 이유 |
|---|---|---|
| `GET /auth/me` | 404 | 존재하지 않음 |
| `GET /auth/session` | 401 | Authorization 헤더 방식, 쿠키 인증 불가 |

### 4. 백엔드가 프론트로 redirect하지 않음

현재 백엔드가 신규 회원 처리 후 프론트(`localhost:3000/auth-callback`)로 redirect하지 않고 JSON을 직접 브라우저에 반환한다.

```json
{
  "is_registered": false,
  "email": "user@kakao.com",
  "nickname": "su",
  "temp_token": "xxxx-xxxx"
}
```

## 해결 방법

### 프론트 (즉시 적용)

`/auth-callback`에 도달하는 사용자 = 무조건 신규 회원이라는 설계 원칙 적용.

- `nickname` 쿠키가 있으면 → 기존 회원 → `/` 이동
- `nickname` 쿠키가 없으면 → 신규 회원 → `/terms` 이동

```ts
// app/auth-callback/page.tsx
const user = getCurrentUserFromCookie()
if (user) {
    setState({ status: "AUTHENTICATED", user })
    router.replace("/")
} else {
    setState({ status: "PENDING_TERMS" })
    router.replace("/terms")
}
```

`detectAuthState()`에서 `temp_token` 체크 제거.

### 백엔드 (요청 필요)

---

## 백엔드 담당자 요청 사항

### 대상 엔드포인트

```
GET /kakao-authentication/request-access-token-after-redirection
```

현재 이 엔드포인트는 카카오 인증 완료 후 JSON을 브라우저에 직접 반환한다.
프론트가 정상 동작하려면 아래와 같이 **HTTP redirect**로 변경이 필요하다.

---

### 요청 1: 신규 회원일 때 프론트 `/auth-callback`으로 redirect

**현재 동작:**
```json
HTTP 200
{
  "is_registered": false,
  "account_id": null,
  "email": "user@kakao.com",
  "nickname": "su",
  "temp_token_issued": true,
  "temp_token": "xxxx-xxxx-xxxx-xxxx"
}
```

**요청 동작:**
```
HTTP 302
Location: http://localhost:3000/auth-callback?nickname=su&email=user@kakao.com
Set-Cookie: temp_token=xxxx-xxxx-xxxx-xxxx; HttpOnly; Path=/; SameSite=Lax
```

- `nickname`, `email`을 query string으로 전달해야 `/signup` 페이지에서 pre-fill 가능
- `temp_token`은 기존과 동일하게 HttpOnly Cookie로 세팅
- 프론트 `/auth-callback` → `/terms` → `/signup` 순서로 이동함

---

### 요청 2: 기존 회원일 때 프론트 메인(`/`)으로 redirect

**현재 동작:**
```
HTTP 302
Location: http://localhost:3000
Set-Cookie: user_token=...; nickname=...; email=...; account_id=...
```

기존 회원 redirect는 현재도 정상 동작하고 있음. 변경 불필요.

---

### 환경변수 / 설정 추가 요청

프론트 URL을 하드코딩하지 않도록 백엔드 환경변수로 관리 권장:

```
FRONTEND_BASE_URL=http://localhost:3000
```

redirect URL:
- 신규 회원: `${FRONTEND_BASE_URL}/auth-callback?nickname=...&email=...`
- 기존 회원: `${FRONTEND_BASE_URL}`

---

### CORS 확인 요청

프론트(`localhost:3000`)에서 백엔드(`localhost:33333`) API 호출 시 CORS 허용 확인:

```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Credentials: true
```

`credentials: include` 옵션으로 쿠키를 전달하기 때문에 `Allow-Credentials: true` 필수.

---

## 현재 상태

| 항목 | 상태 |
|---|---|
| 프론트 `/auth-callback` 로직 수정 | 완료 |
| 백엔드 신규 회원 redirect 구현 | **미완료 — 요청 필요** |
| 백엔드 CORS 설정 확인 | 미확인 |

---

## 코드 검토 의견 (2026-03-21)

### 검토 결과 요약

원인 분석과 요청 사항은 전반적으로 정확하다. 백엔드 코드 직접 확인 결과, 핵심 요청인 신규 회원 redirect 변경은 타당하고 필요하다. 다만 몇 가지 수정이 필요한 내용이 있다.

---

### [확인] 원인 분석 정확도

| 항목 | 정확성 | 비고 |
|---|---|---|
| temp_token HttpOnly 설정 | ✅ 정확 | `kakao_authentication_router.py:88` `httponly=True` 확인 |
| `GET /auth/me` → 404 | ✅ 정확 | 백엔드에 해당 엔드포인트 없음 |
| `GET /auth/session` → 쿠키 인증 불가 | ✅ 정확 | `Authorization: Bearer` 헤더 전용으로 구현됨 |
| 신규 회원에게 JSON 반환 (redirect 없음) | ✅ 정확 | `JSONResponse` 반환 코드 확인 |
| 기존 회원 redirect 정상 동작 | ✅ 정확 | `RedirectResponse(url=settings.cors_allowed_frontend_url)` 확인 |

---

### [수정 필요] 환경변수 추가 요청 — 불필요

`FRONTEND_BASE_URL` 신규 추가를 요청했으나, `settings.py`에 **이미 동일한 역할의 필드가 존재**한다.

```python
# settings.py
cors_allowed_frontend_url: str = "http://localhost:3000"
```

기존 회원 redirect도 이 값을 그대로 사용 중이므로, 신규 환경변수를 추가할 필요 없다.

redirect URL 구성 시 `settings.cors_allowed_frontend_url`을 재사용하면 된다.

```python
# 요청에서 제안한 방식 대신
f"{settings.cors_allowed_frontend_url}/auth-callback?nickname={nickname}&email={email}"
```

---

### [수정 필요] CORS 확인 요청 — 이미 완료

`main.py`에 이미 설정되어 있어 별도 확인이 불필요하다.

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.cors_allowed_frontend_url],
    allow_credentials=True,   # credentials: include 지원
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

### [우려] email을 query string으로 전달하는 방식

요청 1의 redirect URL:
```
Location: http://localhost:3000/auth-callback?nickname=su&email=user@kakao.com
```

이메일을 query string으로 전달하면 아래 위치에 평문으로 노출된다.

- 브라우저 주소창 및 히스토리
- 웹 서버 access 로그
- 브라우저 Referrer 헤더 (외부 리소스 요청 시)

**대안**: `nickname`만 query string으로 전달하고, `email`은 HttpOnly 쿠키로 함께 전달하는 방식을 고려할 수 있다.

```
HTTP 302
Location: http://localhost:3000/auth-callback?nickname=su
Set-Cookie: temp_token=xxxx; HttpOnly; SameSite=Lax
Set-Cookie: pending_email=user@kakao.com; HttpOnly; SameSite=Lax; Max-Age=300
```

`/signup` 페이지에서 email pre-fill이 필요하다면 별도 API(`GET /auth/pending-info`)를 통해 서버에서 읽어오는 방식이 더 안전하다. 단, 개발 초기 단계에서 query string 방식도 실용적인 선택이므로 반드시 변경할 필요는 없다.

---

### [확인] 프론트 해결방안 — `nickname` 쿠키 판별 방식

`nickname` 쿠키 유무로 신규/기존 회원을 구분하는 방식은 현재 백엔드 응답 구조와 일치한다.

- 기존 회원 redirect 시 `nickname` 쿠키를 **HttpOnly 없이** 세팅 → JS에서 읽기 가능
- 신규 회원 redirect 후에는 `nickname` 쿠키 없음

다만 한 가지 엣지 케이스가 있다. 기존 회원의 `nickname` 쿠키가 `max_age=3600`으로 만료된 뒤, 해당 사용자가 재로그인해서 `/auth-callback`에 도달하는 경우다. 이 경우 쿠키가 없어서 신규 회원으로 오인될 수 있다. 현재 설계("백엔드가 redirect해야 `/auth-callback`에 도달")가 지켜진다면 문제없지만, 해당 URL을 직접 입력하는 사용자가 생기면 오작동 가능성이 있다.

→ `/auth-callback` 페이지에 직접 접근을 막는 가드(예: 세션 검증)를 추후 추가하는 것을 권장한다.

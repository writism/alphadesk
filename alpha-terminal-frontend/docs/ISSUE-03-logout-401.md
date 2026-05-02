# ISSUE-03: POST /auth/logout 401 Unauthorized

작성일: 2026-03-21

---

## 현상

Navbar의 Logout 버튼 클릭 시 콘솔에 401 오류가 출력된다.

```
POST http://localhost:33333/auth/logout 401 (Unauthorized)
```

---

## 동작 상태

| 항목 | 상태 |
|------|------|
| 로그아웃 UX (Login 버튼 표시) | ✅ 정상 |
| 쿠키 삭제 (nickname, email, account_id) | ✅ 정상 |
| 백엔드 세션 무효화 | ❌ 실패 (401) |

프론트는 try/catch/finally로 처리하고 있어 UX에는 영향 없음.
단, **백엔드 세션(session_token)이 서버에서 무효화되지 않아** 보안 측면에서 문제가 있다.

---

## 원인 추정

회원가입 완료 후 `window.location.href = redirect_url`로 이동하면,
백엔드가 응답에 `session_token`(HttpOnly) 쿠키를 세팅한다.

이후 프론트에서 `POST /auth/logout` 요청 시 `credentials: include` 옵션으로
`session_token` 쿠키가 전송되어야 하나, 백엔드가 401을 반환한다.

가능한 원인:
1. `session_token` 쿠키가 `/auth/logout` 인증에 사용되지 않음
2. 쿠키 도메인/SameSite 설정 문제로 쿠키가 전송되지 않음
3. `/auth/logout` 엔드포인트가 다른 인증 방식을 기대함

---

## 백엔드 담당자 요청 사항

### 확인 요청

1. `/auth/logout` 엔드포인트가 `session_token` 쿠키 기반으로 인증하는지 확인
2. `account/register` 응답에서 세팅하는 쿠키 이름과 `/auth/logout`에서 기대하는 쿠키 이름이 일치하는지 확인

### 재현 방법

```
1. 카카오 신규 가입 완료 → 메인 페이지 이동 (로그인 상태)
2. Logout 버튼 클릭
3. POST http://localhost:33333/auth/logout → 401
```

### 기대 동작

```
POST /auth/logout
Cookie: session_token=xxxx

→ 200 OK (서버 세션 무효화)
```

---

## 현재 상태

| 항목 | 상태 |
|------|------|
| 프론트 로그아웃 UX (쿠키 삭제 + 상태 초기화) | ✅ 정상 동작 |
| 백엔드 `/auth/logout` 401 원인 파악 | **미완료 — 백엔드 확인 필요** |

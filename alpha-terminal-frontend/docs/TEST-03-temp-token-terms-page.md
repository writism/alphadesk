# TEST-03: 애플리케이션이 임시 토큰을 수신하면 시스템이 약관 동의 페이지 출력

## Success Criteria

- OAuth 로그인 후 신규 사용자라면 백엔드가 임시 토큰(temporary token)을 반환한다
- Cookie 값에 key가 temp_token인 것을 보고 신규 사용자 여부를 판정한다
- `{frontend_url}/auth-callback` 에서 아래 작업이 진행되어야 한다
- 애플리케이션이 임시 토큰을 수신하면 사용자의 약관 동의 상태가 미완료임을 식별한다
- 시스템이 Authentication Callback 페이지로 이동시키고 인증 상태를 확인하여 약관 동의가 필요한지 판정한다
- 임시 토큰이 확인되면 약관 동의 페이지가 화면에 정상적으로 표시된다
- 임시 토큰은 Backend 관점에서 5분간만 유효하다

## To-do

- [x] 임시 토큰 수신 로직을 구현한다 (`detectAuthState` — `temp_token` Cookie 유무로 판정)
- [x] 임시 토큰과 정식 토큰을 구분하는 인증 상태 처리를 구현한다 (`AuthState.PENDING_TERMS` 추가)
- [x] 임시 토큰 수신 시 약관 동의 페이지로 리다이렉트를 구현한다 (`/auth-callback` → `/terms`)
- [x] 약관 동의 페이지 라우트를 구성한다 (`/terms`, `/auth-callback`)

## 플로우

```
카카오 로그인
  → GET /kakao-authentication/request-oauth-link
  → Kakao 인증
  → 백엔드 처리
  → 신규 회원: temp_token Cookie 세팅 + redirect → {frontend}/auth-callback
     → /auth-callback: temp_token 감지 → PENDING_TERMS 상태 → redirect /terms
     → /terms: 약관 동의 → /signup (nickname, email 입력 → POST /account/register)
  → 기존 회원: user 쿠키 세팅 + redirect → {frontend}
     → / : AUTHENTICATED 상태
```

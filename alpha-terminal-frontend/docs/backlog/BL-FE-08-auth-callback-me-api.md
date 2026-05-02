# BL-FE-08

**Backlog Type**
Behavior Backlog

**Backlog Title**
애플리케이션이 임시 토큰을 수신하면 인증 콜백 페이지에서 임시 토큰과 사용자 정보를 확인한다

**배경**
OAuth 로그인 후 신규 사용자라면 백엔드가 temp_token을 HttpOnly Cookie에 담아 /auth-callback으로 리다이렉트한다.
기존 구현은 nickname 쿠키 존재 여부로 신규/기존 사용자를 판단했으나,
실제 인증 상태는 /authentication/me API 응답의 is_registered 필드로 판정해야 한다.
임시 토큰은 백엔드 관점에서 5분간만 유효하다.

**Success Criteria**
- OAuth 로그인 완료 후 /auth-callback 페이지에서 /authentication/me API를 호출한다
- /authentication/me 요청 시 temp_token 또는 user_token 쿠키를 함께 전송한다 (credentials: include)
- API 응답에서 is_registered, nickname, email 정보를 획득한다
- is_registered가 true이면 기존 사용자로 판정한다
- is_registered가 false이면 신규 사용자(약관 동의 필요)로 판정한다
- API 호출 실패 시 UNAUTHENTICATED 상태로 전환한다

**Todo**
1. /authentication/me 응답 타입 AuthMeResponse를 정의한다
2. fetchAuthMe() API 함수를 구현한다
3. handleAuthCallback을 비동기로 변경하고 fetchAuthMe()를 호출하도록 구현한다
4. 응답 결과에 따라 AUTHENTICATED 또는 PENDING_TERMS 상태로 전환하도록 구현한다

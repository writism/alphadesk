# TEST-02: 카카오 OAuth 인증 플로우를 구현한다

## Success Criteria

- 카카오 로그인 버튼 클릭 시 `window.location.href`로 `/kakao-authentication/request-oauth-link`로 이동한다
- 기존 회원 로그인 완료 후 메인 페이지에서 Cookie(`nickname`, `email`, `account_id`)를 읽어 로그인 상태를 표시한다
- 신규 회원인 경우 백엔드가 `/signup`으로 redirect하며, 프론트는 해당 페이지에서 회원가입 폼을 제공한다
- `/signup` 페이지에서 nickname, email 입력 후 "가입하기" 클릭 시 `POST /account/register`를 `credentials: include`로 호출한다
- 회원가입 성공 후 메인 페이지(`/`)로 이동한다
- temp_token 없음(401) → 로그인 페이지로 이동, 만료(400) → 재로그인 안내 메시지, 서버 오류(500) → 에러 메시지를 표시한다
- 인증 상태는 `nickname` Cookie 유무로 판단한다 (`session_token`/`user_token`은 HttpOnly라 JS에서 읽기 불가)

## To-do

- [ ] `.env.local`의 `NEXT_PUBLIC_KAKAO_LOGIN_PATH`를 `/kakao-authentication/request-oauth-link`로 수정하고 `NEXT_PUBLIC_GOOGLE_LOGIN_PATH`를 제거한다
- [ ] `AuthUser` 도메인 모델을 `{ nickname, email, accountId }` 로 수정한다
- [ ] Cookie 유틸리티 함수 `getCookie(name)`를 구현한다 (`infrastructure/utils/cookie.ts`)
- [ ] 인증 상태 감지를 Cookie 기반으로 교체한다 — `GET /auth/me` 대신 `nickname` Cookie 유무로 AUTHENTICATED 판단하고 AuthUser를 Cookie에서 읽는다
- [ ] 회원가입 API `registerUser({ nickname, email })`를 infrastructure layer에 추가한다 (`POST /account/register`, `credentials: include`)
- [ ] 회원가입 hook `useSignup`을 application layer에 추가한다 (register 호출, 성공 시 `/` 이동, 에러 처리)
- [ ] `/signup` 페이지를 구현한다 (nickname·email 입력 필드, Kakao 기본값 pre-fill, "가입하기" 버튼, 에러 메시지 표시)

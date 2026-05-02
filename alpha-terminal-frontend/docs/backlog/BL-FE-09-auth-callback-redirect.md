# BL-FE-09

**Backlog Type**
Behavior Backlog

**Backlog Title**
애플리케이션이 인증 콜백 페이지에서 신규 사용자를 감지하면 약관 페이지로 이동한다

**배경**
/auth-callback 페이지에서 /authentication/me API 응답의 is_registered 값으로 신규/기존 사용자를 구분하고,
결과에 따라 적절한 페이지로 리다이렉트해야 한다.
신규 사용자(is_registered: false)는 약관 동의 페이지로 이동하며,
이때 nickname과 email을 쿼리 파라미터로 전달하여 이후 회원가입 폼에서 활용할 수 있도록 한다.

**Success Criteria**
- is_registered가 false이면 /terms?nickname=...&email=... 으로 리다이렉트한다
- is_registered가 true이면 메인 페이지(/)로 리다이렉트한다
- /authentication/me API 호출이 실패하면 /login 으로 리다이렉트한다
- nickname과 email을 쿼리 파라미터로 /terms 페이지에 전달한다

**Todo**
1. /auth-callback 페이지에서 handleAuthCallback 비동기 호출을 구현한다
2. pending_terms 결과 시 nickname/email을 쿼리 파라미터로 담아 /terms로 리다이렉트를 구현한다
3. authenticated 결과 시 메인 페이지로 리다이렉트를 구현한다
4. error 결과 시 /login으로 리다이렉트하는 에러 처리를 구현한다

# BL-FE-14

**Backlog Type**
Behavior Backlog

**Backlog Title**
애플리케이션이 회원가입 페이지에서 회원가입 요청을 백엔드에 전송한다

**배경**
기존 회원가입은 /account/register 엔드포인트를 사용하고 이메일 필드가 편집 가능했다.
신규 엔드포인트 POST /account/sign-up 으로 변경하고,
이메일은 읽기 전용, 닉네임은 편집 가능한 형태로 제공해야 한다.
프로필 정보(nickname, email)가 없으면 약관 동의 페이지로 리다이렉트한다.

**Success Criteria**
- 회원가입 페이지 진입 시 nickname/email 프로필이 없으면 약관 동의 페이지로 리다이렉트한다
- 조회된 nickname을 편집 가능한 상태로 초기화한다
- email은 읽기 전용으로 표시한다
- POST /account/sign-up 에 SignupRequest { nickname, email }를 전송한다
- 회원가입 성공 시 메인 페이지(/)로 리다이렉트한다
- 회원가입 실패 시 에러 메시지를 표시한다

**Todo**
1. SignupRequest 타입 및 signUpUser() API 함수를 구현한다
2. useSignup 훅에서 /account/sign-up 호출 및 성공 시 / 리다이렉트를 구현한다
3. 회원가입 페이지 진입 시 프로필 미존재 여부를 확인하여 리다이렉트를 구현한다
4. email 필드를 읽기 전용으로 표시한다

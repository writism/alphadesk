# BL-FE-13

**Backlog Type**
Behavior Backlog

**Backlog Title**
애플리케이션이 약관 동의 완료 후 회원가입 페이지로 이동한다

**배경**
약관 동의 완료 후 기존 /signup으로 이동하던 로직을 /account/signup으로 변경해야 한다.
동의한 약관 정보를 저장하고, 약관 페이지에서 전달받은 nickname/email을 회원가입 페이지로 전달해야 한다.

**Success Criteria**
- 필수 약관에 모두 동의한 상태에서 동의 버튼 클릭 시 약관 동의 정보를 저장한다
- 약관 동의 완료 후 /account/signup으로 리다이렉트된다
- 약관 페이지로 전달된 nickname, email을 /account/signup으로 함께 전달한다
- /account/signup 페이지가 정상적으로 표시된다
- 약관 미동의 상태에서 /account/signup 직접 접근 시 /terms로 리다이렉트된다

**Todo**
1. 동의한 약관 ID 목록을 저장하는 termsConsentAtom을 구현한다
2. 약관 동의 완료 후 /account/signup으로 리다이렉트를 구현한다
3. /account/signup 페이지 라우트를 구성한다
4. 약관 미동의 상태의 /account/signup 접근 제어를 구현한다

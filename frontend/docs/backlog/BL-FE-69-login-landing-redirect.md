# BL-FE-69

**Backlog Type**
Behavior Backlog

**Backlog Title**
로그인한 사용자가 앱에 진입하면 관심종목 유무에 따라 랜딩페이지로 자동 이동한다

**Success Criteria**
- 관심종목이 없는 사용자는 로그인 후 무조건 MY 페이지로 이동한다
- 관심종목이 있는 사용자는 로그인 후 사용자가 설정한 랜딩페이지로 이동한다
- 랜딩페이지 설정이 없는 기존 사용자는 기본값 HOME으로 이동한다
- 랜딩페이지 설정은 MY 페이지에서 변경 가능하다

**Todo**
1. 랜딩페이지 선택지를 domain model에 정의한다 (LandingPage: HOME | DASHBOARD | MARKET_FEED | AI_INSIGHT | BOARD)
2. 랜딩페이지 설정을 localStorage에 저장/조회하는 infrastructure adapter를 구현한다
3. 랜딩페이지 설정 상태를 관리하는 atom을 정의한다 (기본값: HOME)
4. 로그인 완료 시점에 관심종목 유무와 랜딩페이지 설정을 읽어 분기 리다이렉트하는 훅을 구현한다
5. 로그인 콜백 흐름(useAuth 또는 OAuth 콜백 페이지)에서 랜딩페이지 분기 훅을 호출한다

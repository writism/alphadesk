# BL-FE-51

**Backlog Type**
Feature / layout / navigation

**Backlog Title**
네비게이션 바 상단 고정 레이아웃 — 주식 추천 링크 추가

**Success Criteria**
- 네비게이션 바가 페이지 상단에 고정되어 표시된다
- 페이지를 스크롤해도 네비게이션 바가 화면 상단에 유지된다
- 네비게이션 바에 애플리케이션 로고 또는 타이틀이 표시된다
- 네비게이션 바는 DashBoard, Watchlist, Board, 주식 추천, Videos, Login/Logout 버튼을 가지고 있다

**Todo**
1. [x] 상단 고정 네비게이션 바 레이아웃을 구현한다 (`TopBar.tsx`)
2. [x] 애플리케이션 로고 또는 타이틀 영역을 구현한다
3. [x] AppLayout에 네비게이션 바를 포함하는 레이아웃 구조를 구현한다 (`ClientShell.tsx`)
4. [x] 주식 추천 링크를 TopBar / SideBar / MobileNavBar에 추가한다 (`/stock-theme`)
5. [x] `/stock-theme` 페이지를 생성한다

**관련**
- [BL-BE-52](../../alpha-desk-ai-server/docs/backlog/BL-BE-52-market-analysis-langchain-qa.md) — 관심종목 LangChain Q&A
- [BL-BE-23](../../alpha-desk-ai-server/docs/backlog/BL-BE-23-stock-theme-mapping.md) — 종목-테마 매핑

**개정 이력**
- 2026-03-31: 초안 및 구현

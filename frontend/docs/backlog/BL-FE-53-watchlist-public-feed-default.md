# BL-FE-53

**Backlog Type**
Feature / watchlist / ux

**Backlog Title**
PUBLIC_FEED 참여 기본값을 '공개 중'으로 변경

**Success Criteria**
- 신규 계정의 PUBLIC_FEED 기본값이 '공개 중'(true)이다
- 로딩 중에도 버튼이 '공개 중' 상태로 표시된다 (낙관적 기본값)
- '공개 → 비공개' 또는 '비공개 → 공개' 전환 시 동의 모달 없이 버튼 클릭 한 번으로 즉시 토글된다

**Todo**
1. [x] BE: `AccountORM.is_watchlist_public` default 값을 `True`로 변경
2. [x] BE: `main.py` 마이그레이션 SQL의 `DEFAULT FALSE` → `DEFAULT TRUE`로 변경
3. [x] FE: `useAccountSettings` 초기 state를 `true`로 변경 (낙관적 기본값)
4. [x] FE: `watchlist/page.tsx`에서 `showPublicConsent` 모달 및 관련 state 제거, 버튼 직접 토글로 변경

**개정 이력**
- 2026-03-31: 초안 및 구현

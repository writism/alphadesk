# BL-FE-26

**Backlog Type**
Refactor Backlog

**Backlog Title**
대시보드 페이지를 섹션 단위 컴포넌트로 분리한다

**배경**
`app/dashboard/page.tsx`가 과도하게 길어져 수정 시 회귀 위험이 크다.
파이프라인 결과·관심종목·로그·요약을 파일로 나누면 가독성과 재사용이 좋아진다.

**Success Criteria**
- 파이프라인 결과, 관심종목, 분석 로그, AI 요약이 각각 별도 컴포넌트 파일로 분리된다
- 배지·날짜 포맷 등 공통 상수는 공유 모듈로 둔다
- 동작과 UI는 기존과 동등하다

**Todo**
1. `app/dashboard/components/` 아래에 섹션 컴포넌트와 `dashboardBadges` 유틸을 추가한다
2. `page.tsx`는 상태와 훅만 조합하는 얇은 페이지로 유지한다

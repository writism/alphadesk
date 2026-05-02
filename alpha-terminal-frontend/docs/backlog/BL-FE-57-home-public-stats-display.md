# BL-FE-57

**Backlog Type**
Feature / home / public-stats

**Backlog Title**
홈 화면 익명 사용자 공개 데이터 표시 — 공개 관심종목 기반 센티먼트 위젯

**Success Criteria**
- 익명(비인증) 사용자도 홈 화면에서 센티먼트 게이지·알파 기회·오늘의 브리핑을 볼 수 있다
- 표시 데이터는 `GET /public/home-stats` 에서 가져온다 (공개 관심종목 + 대표 종목 기준)
- 헤더 서브타이틀에 "공개 관심종목 기준" 뱃지를 표시하여 개인화 데이터가 아님을 명시한다
- 로그인 시 자동으로 개인화 데이터(내 관심종목)로 전환된다
- 공개 데이터도 없으면(빈 배열) 기존 로그인 유도 화면을 표시한다

**Todo**
1. [x] `features/public/infrastructure/api/publicApi.ts` 에 `fetchPublicHomeLogs()` 추가
2. [x] `features/home/application/hooks/useHome.ts` 에 `PUBLIC_READY` 상태 추가; 401 시 공개 데이터 fetch
3. [x] `app/page.tsx` 에서 `PUBLIC_READY` 상태 처리; 위젯 표시 + 공개 뱃지 + 로그인 유도 배너

**관련**
- [BL-BE-53](../../alpha-desk-ai-server/docs/backlog/BL-BE-53-public-home-stats-api.md) — 공개 홈 통계 API

**개정 이력**
- 2026-03-31: 초안 및 구현

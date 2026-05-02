# BL-FE-52

**Backlog Type**
Feature / youtube / ux

**Backlog Title**
Videos 페이지 날짜순 정렬 (최신순/오래된순 토글)

**Success Criteria**
- 기본 정렬은 최신순(내림차순)이다
- 정렬 토글 버튼으로 최신순 ↔ 오래된순 전환이 가능하다
- 정렬은 클라이언트에서 `published_at` 기준으로 수행한다
- 관심종목 탭 전환 시 정렬 설정이 유지된다

**Todo**
1. [x] `YoutubeVideoFeed`에 `sortOrder` 상태 추가 (기본값: `"desc"`)
2. [x] 렌더 전 `items`를 `published_at` 기준으로 정렬
3. [x] 정렬 토글 버튼 UI 추가

**개정 이력**
- 2026-03-31: 초안 및 구현

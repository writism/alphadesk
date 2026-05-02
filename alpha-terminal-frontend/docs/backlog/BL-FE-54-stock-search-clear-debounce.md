# BL-FE-54

**Backlog Type**
Feature / watchlist / ux

**Backlog Title**
STOCK_SEARCH 입력창 클리어 버튼 추가 및 검색 속도 개선 (debounce)

**Success Criteria**
- 입력창 오른쪽 끝에 입력 내용을 한꺼번에 삭제하는 X 버튼이 표시된다 (query가 있을 때만)
- X 버튼 클릭 시 입력창이 비워지고 검색 결과가 초기화된다
- 검색은 입력 후 300ms debounce를 적용하여 불필요한 API 호출을 줄인다

**Todo**
1. [x] `useStockSearch` 훅에 300ms debounce 추가
2. [x] `watchlist/page.tsx` 검색 입력창 내부 오른쪽에 X(클리어) 버튼 추가

**개정 이력**
- 2026-03-31: 초안 및 구현

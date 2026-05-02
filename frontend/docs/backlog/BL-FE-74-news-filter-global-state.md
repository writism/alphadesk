# BL-FE-74

**Backlog Type**
Behavior Backlog

**Backlog Title**
인증된 사용자가 뉴스_피드에서 마켓 필터를 선택한 후 다른 메뉴로 이동했다가 돌아오면 필터 상태가 유지된다

**Success Criteria**
- 선택한 마켓 필터(ALL/KR/US)가 복귀 후에도 그대로 유지된다
- 필터 변경 없이 복귀 시 불필요한 재요청이 발생하지 않는다
- stock-recommendation과 동일한 전역 atom 기반 상태 관리 구조를 따른다

**Todo**
1. news domain에 마켓 필터 전역 atom을 정의한다 (marketFilter)
2. useNewsList 훅의 로컬 marketFilter state를 전역 atom으로 교체한다

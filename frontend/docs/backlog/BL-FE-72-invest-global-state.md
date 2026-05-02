# BL-FE-72

**Backlog Type**
Behavior Backlog

**Backlog Title**
인증된 사용자가 투자_판단 분석 중 다른 메뉴로 이동했다가 돌아오면 분석 상태가 유지된다

**Success Criteria**
- 분석 진행 중 다른 메뉴로 이동 후 복귀 시 에이전트 로그와 결과가 그대로 표시된다
- 분석이 완료된 상태에서 이동 후 복귀해도 결과가 초기화되지 않는다
- 입력한 쿼리가 복귀 후에도 유지된다
- stock-recommendation과 동일한 전역 atom 기반 상태 관리 구조를 따른다

**Todo**
1. invest domain에 분석 상태 전역 atom을 정의한다 (query, logs, result, isLoading, error)
2. useInvestJudgment 훅의 로컬 state를 전역 atom으로 교체한다
3. SSE 스트림 진행 중 페이지 이탈 시 isLoading을 false로 정리하는 cleanup을 추가한다

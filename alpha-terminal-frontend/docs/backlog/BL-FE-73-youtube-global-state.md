# BL-FE-73

**Backlog Type**
Behavior Backlog

**Backlog Title**
인증된 사용자가 영상_피드 탭에서 종목 또는 정렬을 선택한 후 다른 메뉴로 이동했다가 돌아오면 선택 상태가 유지된다

**Success Criteria**
- 선택한 관심종목 탭이 복귀 후에도 그대로 유지된다
- 정렬 순서(최신순/오래된순)가 복귀 후에도 유지된다
- stock-recommendation과 동일한 전역 atom 기반 상태 관리 구조를 따른다

**Todo**
1. youtube domain에 선택 상태 전역 atom을 정의한다 (selectedName, sortOrder)
2. YoutubeVideoFeed 컴포넌트의 로컬 state를 전역 atom으로 교체한다

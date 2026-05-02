# BL-FE-04

**Backlog Type**
Behavior Backlog

**Backlog Title**
애플리케이션이 관심종목 목록을 대시보드에 로드한다

**의존성**
- 없음 (백엔드 `GET /watchlist` 이미 구현되어 있음)

**Success Criteria**
- 대시보드 진입 시 `GET /watchlist`를 호출하여 관심종목 목록을 가져온다
- 각 항목의 symbol, name, market이 상태에 저장된다
- 로딩 중에는 로딩 상태가 활성화된다
- API 호출 실패 시 에러 상태가 활성화된다
- 등록된 관심종목이 없으면 빈 목록 상태가 반환된다

**Todo**
1. `GET /watchlist` 호출 로직을 구현한다
2. 응답 데이터를 관심종목 목록 상태에 저장한다
3. 로딩, 에러, 빈 목록 상태를 관리한다
4. 대시보드 진입 시 자동으로 목록 로드를 트리거한다

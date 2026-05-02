# BL-FE-02

**Backlog Type**
Behavior Backlog

**Backlog Title**
인증된 사용자가 검색된 종목을 관심종목으로 등록한다

**의존성**
- BL-FE-01 (종목 검색) 선행 완료 후 진행

**Success Criteria**
- 검색 결과에서 종목을 선택하면 symbol, name, market이 등록 요청에 포함된다
- `POST /watchlist` 201 응답 시 관심종목 목록 상태에 항목이 추가된다
- 이미 등록된 종목을 등록하면 409 응답을 받고 중복 안내 메시지가 반환된다
- 등록 성공 후 검색 상태가 초기화된다

**Todo**
1. 선택된 종목의 symbol, name, market을 `POST /watchlist`로 전송하는 로직을 구현한다
2. 등록 성공 시 관심종목 목록 상태를 갱신한다
3. 중복 등록(409) 에러 상태를 처리한다
4. 등록 성공 후 검색 상태를 초기화한다

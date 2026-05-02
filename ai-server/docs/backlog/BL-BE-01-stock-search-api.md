# BL-BE-01

**Backlog Type**
Behavior Backlog

**Backlog Title**
애플리케이션이 종목 코드 또는 종목명으로 종목을 검색하여 반환한다

**배경**
프론트엔드 BL-FE-01 구현을 위해 필요한 신규 API.
현재 백엔드에 종목 검색 엔드포인트가 없어 신규 구현 필요.

**Success Criteria**
- `GET /stocks/search?q=검색어` 요청을 수신한다
- 검색어가 1자 미만이면 400 응답을 반환한다
- 종목 코드 또는 종목명으로 코스피/코스닥/나스닥 전체를 검색한다
- 검색 결과로 종목 코드(symbol), 종목명(name), 시장명(market) 목록을 반환한다
- 검색 결과가 없으면 빈 배열을 반환한다

**응답 형식**
```json
[
  { "symbol": "005930", "name": "삼성전자", "market": "KOSPI" },
  { "symbol": "AAPL",   "name": "Apple Inc.", "market": "NASDAQ" }
]
```

**Todo**
1. 종목 코드/종목명 검색 데이터 소스를 결정한다 (외부 API 또는 내부 DB)
2. `GET /stocks/search?q=` 엔드포인트를 구현한다
3. 검색어 유효성 검사(1자 미만 → 400)를 구현한다
4. 검색 결과를 symbol, name, market 형태로 반환하는 응답 DTO를 구현한다
5. 검색 결과가 없을 때 빈 배열을 반환한다

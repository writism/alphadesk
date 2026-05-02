# BL-BE-02

**Backlog Type**
Behavior Backlog

**Backlog Title**
종목 검색이 전체 상장 종목을 대상으로 동작한다

**배경**
현재 `GET /stocks/search?q=` 는 백엔드 코드에 하드코딩된 약 90개 종목 목록(`InMemoryStockRepository`)만 검색한다.
실제 상장 종목(네이버, 카카오페이, NHN KCP, 헥토파이낸셜 등)은 목록에 없어 검색이 불가능하다.

**현재 문제**
- `네이버` 검색 불가 (목록에 `NAVER` 영문명만 존재)
- `카카오페이` 검색 불가 (카카오만 존재)
- `NHN KCP`, `헥토파이낸셜` 등 다수 실존 종목 검색 불가
- 검색 가능한 종목이 약 90개로 한정됨

**Success Criteria**
- KOSPI, KOSDAQ 전체 상장 종목을 종목 코드 또는 종목명으로 검색할 수 있다
- 종목명 한글/영문 모두 검색된다
- 검색 결과에 symbol, name, market이 포함된다

**Todo**
1. KRX(한국거래소) 또는 DART API에서 전체 상장 종목 목록을 가져온다
2. 종목 데이터를 DB 또는 캐시에 저장한다
3. `InMemoryStockRepository` 하드코딩 목록을 실제 데이터로 교체한다
4. 종목명 한글/영문 모두 검색 가능하도록 인덱싱한다

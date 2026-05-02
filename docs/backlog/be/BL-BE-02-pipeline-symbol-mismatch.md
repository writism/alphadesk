# BL-BE-02

**Backlog Type**
Behavior Backlog

**Backlog Title**
애플리케이션이 파이프라인 기사 수집 시 종목 코드와 종목명 불일치를 수정한다

**배경 / 원인**
현재 DB에 기사가 `symbol="삼성전자"` (한글 종목명)으로 저장된 상태이다.
파이프라인은 watchlist에서 `symbol="005930"` (종목 코드)를 가져와 수집 후 `find_all(symbol="005930")`로 조회한다.
dedup key(source_type + source_doc_id)는 내용 기반이므로 이미 "삼성전자"로 저장된 기사들이 dedup 충돌을 일으켜
"005930"으로는 재저장도, 조회도 안 되는 상태가 된다.

재현 확인:
- `GET /stock-collector/articles` → `symbol="삼성전자"` 86개 존재
- `GET /stock-collector/articles?symbol=005930` → 0개
- `POST /pipeline/run` → `{"symbol":"005930","skipped":true,"reason":"수집된 기사 없음"}`

**Success Criteria**
- 뉴스 수집 시 RawArticle의 symbol 필드는 반드시 종목 코드(예: "005930")로 저장된다
- 잘못된 symbol(한글 종목명)로 저장된 기존 기사들을 종목 코드로 마이그레이션하거나 삭제한다
- 한글 종목명으로 검색 시 결과가 0건이면 영문 종목명으로 재검색한다
- 한글 검색과 영문 검색 결과를 합산하여 반환한다
- 파이프라인 실행 후 `GET /pipeline/summaries`에 005930 분석 결과가 포함된다

**Todo**
1. DB의 `symbol="삼성전자"` 기사를 `symbol="005930"`으로 업데이트하거나 삭제한다 (일회성 정리)
2. `NewsCollectorAdapter.collect()`의 keyword 변환 로직이 symbol에 영향을 주지 않는지 확인한다
3. 한글 keyword로 SerpAPI 검색 결과가 0건일 때 영문 keyword로 재검색하는 fallback 로직을 구현한다
4. symbol이 코드 형식이 아닌 경우 수집을 거부하거나 경고 로그를 남기도록 방어 코드를 추가한다
5. 파이프라인 재실행 후 005930 기사 수집 및 분석 결과를 검증한다

# KRX 시장구분 동기화

## 목적

DART `corpCode.xml` 벌크 API에는 `corp_cls`(시장구분) 필드가 포함되지 않아
`/stocks/sync` 실행 후 모든 종목의 `market` 컬럼이 빈 문자열로 저장된다.

이 기능은 **KRX KIND 공개 데이터**를 사용하여
DB `stocks` 테이블의 `market` 컬럼을 `KOSPI / KOSDAQ / KONEX`로 업데이트한다.

---

## 데이터 출처

| 항목 | 내용 |
|------|------|
| URL | `https://kind.krx.co.kr/corpgeneral/corpList.do` |
| 인증 | 없음 (공개 엔드포인트) |
| 방식 | HTTP GET, 응답: EUC-KR HTML 테이블 |
| 요청 횟수 | 3회 (KOSPI, KOSDAQ, KONEX 각 1회) |

### 요청 파라미터

| 시장 | `marketType` 값 |
|------|-----------------|
| KOSPI | `stockMkt` |
| KOSDAQ | `kosdaqMkt` |
| KONEX | `konexMkt` |

공통 파라미터: `method=download`, `searchType=13`

---

## 실행 순서

> `/stocks/sync` 먼저 실행 후 `/stocks/sync-market` 실행해야 한다.

```
1. GET /stocks/sync        ← DART API로 전체 종목 DB 저장 (3,951개)
2. GET /stocks/sync-market ← KRX KIND로 시장구분 업데이트 (~2,500개)
```

---

## API 엔드포인트

### `GET /stocks/sync-market`

KRX KIND에서 KOSPI/KOSDAQ/KONEX 종목 리스트를 수집하고
DB `stocks.market` 컬럼을 일괄 업데이트한다.

**응답 예시**
```json
{"updated": 2487}
```

- 상장 종목만 업데이트 (KONEX 소수 포함)
- 비상장 법인은 market 값 변경 없음

---

## 아키텍처

```
GET /stocks/sync-market (stock_router.py)
  └─ SyncMarketUseCase.execute()
       ├─ KrxMarketPort.fetch_market_map()
       │    └─ KrxMarketAdapter  ← kind.krx.co.kr HTML 파싱
       └─ StockRepositoryPort.update_market_bulk(market_map)
            └─ StockRepositoryImpl  ← DB UPDATE
```

### 파일 구조

```
app/domains/stock/
  application/
    usecase/
      krx_market_port.py          ← ABC 포트
      sync_market_usecase.py      ← UseCase
  adapter/
    outbound/
      external/
        krx_market_adapter.py     ← KRX KIND HTML 파싱 어댑터
    inbound/
      api/
        stock_router.py           ← GET /stocks/sync-market 엔드포인트
```

---

## 주의사항

- KRX KIND는 브라우저 외 접근을 제한하는 경우가 있음 → `User-Agent`, `Referer` 헤더 필수
- `kind.krx.co.kr` 공식 OpenAPI(`open.krx.co.kr`)와 다른 경로임 (키 불필요)
- HTML 응답 인코딩: `EUC-KR`
- 종목코드 추출 정규식: `mso-number-format` 스타일이 붙은 6자리 숫자 셀

# raw_article 공용 스키마 (v1)

R1(수집기) → R2(정규화기) → R3(AI 처리기) 전체 파이프라인의 입력 계약.

---

## 필드 목록

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| id | UUID (string) | O | 고유 식별자 (UUID v4) |
| source_type | enum | O | `NEWS`, `DISCLOSURE`, `REPORT` |
| source_name | string | O | 수집 출처명 (예: `DART`, `NAVER_NEWS`) |
| source_doc_id | string | O | 원본 문서 고유 ID |
| url | string | O | 원문 URL |
| title | string | O | 기사/공시 제목 |
| body_text | text | O | 본문 텍스트 |
| published_at | datetime (ISO 8601) | O | 원문 발행 시각 |
| collected_at | datetime (ISO 8601) | O | 수집 시각 |
| symbol | string(6) | O | 종목 코드 (6자리 숫자) |
| market | string | X | `KOSPI`, `KOSDAQ` |
| lang | string(2) | X | 언어 코드 (기본: `ko`) |
| author | string | X | 작성자/출처 기관 |
| content_hash | string | O | 본문 해시 (`sha256:...`) |
| collector_version | string | O | 수집기 버전 |
| status | enum | O | `COLLECTED`, `FAILED` |
| error_code | string | X | 실패 시 에러 코드 |
| error_message | string | X | 실패 시 에러 메시지 |
| meta | JSON | X | 소스별 추가 메타데이터 |

---

## source_type 정의

| 값 | 설명 | 예시 소스 |
|----|------|-----------|
| `NEWS` | 뉴스 기사 | 네이버 뉴스, 구글 뉴스 |
| `DISCLOSURE` | 공시 문서 | DART 전자공시 |
| `REPORT` | 증권사 리포트 | 증권사 리서치 |

---

## source_doc_id 규칙

원본 시스템의 고유 문서 ID를 그대로 사용한다.

| source_name | source_doc_id 예시 | 설명 |
|-------------|-------------------|------|
| `DART` | `20260315000123` | DART 접수번호 (rcpNo) |
| `NAVER_NEWS` | `0005123456` | 네이버 뉴스 기사 ID |

---

## dedup_key 기준

중복 판단 기준: **`source_type` + `source_doc_id`**

동일한 `source_type`과 `source_doc_id` 조합이 이미 존재하면 중복으로 판단하고 저장하지 않는다.

> content_hash는 보조 수단으로, 같은 문서의 내용이 변경되었는지 확인할 때 사용한다.

---

## stock_symbol 표준 규칙

| 규칙 | 설명 | 예시 |
|------|------|------|
| 6자리 숫자 문자열 | KRX 종목 코드 기준 | `005930` (삼성전자) |
| 앞자리 0 유지 | 문자열로 저장 (숫자 변환 금지) | `000660` (SK하이닉스) |
| market은 별도 필드 | symbol에 시장 정보 포함하지 않음 | symbol: `005930`, market: `KOSPI` |

---

## status 정의

| 값 | 설명 |
|----|------|
| `COLLECTED` | 정상 수집 완료 |
| `FAILED` | 수집 실패 (error_code, error_message 참조) |

---

## fixture 예시

```json
{
  "id": "6ecab8bb-0d84-4bcf-bb2e-a5f2d6d4c8f1",
  "source_type": "DISCLOSURE",
  "source_name": "DART",
  "source_doc_id": "20260315000123",
  "url": "https://dart.fss.or.kr/dsaf001/main.do?rcpNo=20260315000123",
  "title": "삼성전자 유상증자 결정 공시",
  "body_text": "삼성전자는 운영자금 확보를 위해 유상증자를 결정했다고 공시했다...",
  "published_at": "2026-03-15T08:30:00+09:00",
  "collected_at": "2026-03-15T08:31:10+09:00",
  "symbol": "005930",
  "market": "KOSPI",
  "lang": "ko",
  "author": "금융감독원 전자공시시스템",
  "content_hash": "sha256:9f8a06f0c5f617ecb4f0d1a46e7e5a0f808b32f9a6d319dd18f6715f6e0ec4f2",
  "collector_version": "collector-v1.0.0",
  "status": "COLLECTED",
  "error_code": null,
  "error_message": null,
  "meta": {
    "report_type": "유상증자결정",
    "corp_name": "삼성전자",
    "rcp_no": "20260315000123"
  }
}
```

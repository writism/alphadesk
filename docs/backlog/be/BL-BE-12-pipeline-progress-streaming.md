# BL-BE-12

**Backlog Type**  
Behavior / API / Infrastructure Backlog

**Backlog Title**  
파이프라인 실행 중 수집·정규화·분석 단계를 클라이언트에 스트리밍(또는 동등한 실시간 이벤트)으로 전달한다

---

## 1. 문제 정의

### 1.1 현재 동작
- 엔드포인트: `POST /pipeline/run` (`app/domains/pipeline/adapter/inbound/api/pipeline_router.py`)
- 요청 본문: `RunPipelineRequest` — 선택 `symbols`, 쿠키 `account_id`
- 응답: 파이프라인 **전체 완료 후** `{ "message", "processed" }` 만 반환
- 내부에서 `RunPipelineUseCase.execute`가 종목 루프 안에서 수집 → 정규화 → 분석을 수행하며, 완료 후 요약·로그는 메모리 레지스트리 및 `analysis_logs` 테이블에 반영

### 1.2 사용자·프론트 요구
- 상단 “선택 종목 분석” 클릭 후 **수십 초~1분** 동안 화면 중앙(“AI 분석 요약” 영역)에 **실제 진행 단계**를 보여 주고 싶음  
  예: Serp(구글 뉴스) 수집 중 → DART 수집 → Finnhub 수집 → 네이버 뉴스 수집 → 기사 정규화 → AI 분석 …
- 단계 문구는 **실제 코드 경로와 일치**해야 함(가짜 타이머/고정 문구만으로는 불충분)
- 완료 후에는 기존과 같이 요약 카드·하단 로그 목록 갱신 가능해야 함

### 1.3 기술적 결론
중간 단계 이벤트를 내려면 **백엔드가 실행 루프 도중 이벤트를 flush**할 수 있는 전송 방식이 필요함. 기존 단일 JSON 응답만으로는 불가.

---

## 2. 목표 (Success Criteria)

| ID | 기준 |
|----|------|
| SC-1 | 클라이언트가 **한 번의 파이프라인 실행**에 대해 **시간 순서가 보장된 이벤트 열**을 수신할 수 있다. |
| SC-2 | 각 이벤트는 최소 `type`, `phase`(또는 동등 분류), ISO8601 `at`, 사람이 읽을 수 있는 `message`를 포함한다. |
| SC-3 | 종목 단위 작업이 있는 경우 `symbol` 필드로 식별 가능하다. |
| SC-4 | 수집 소스가 구분되는 경우 `source` 필드가 `DART` \| `GOOGLE_NEWS` \| `FINNHUB` \| `NAVER_NEWS` 등과 **문서화된 enum**으로 맞는다. (`BL-BE-11` 다중 수집기와 정합) |
| SC-5 | 오류 시 `type: "error"` (또는 `phase: "ERROR"`) 이벤트와 함께 스트림/연결이 **명확한 규칙**으로 종료된다. |
| SC-6 | `account_id` 쿠키(또는 향후 세션 정책)가 동기 API와 **동일하게** 적용된다. |
| SC-7 | 스케줄러 등 **서버 내부 호출**(`run_pipeline_job`)은 기존처럼 이벤트 소비 없이 동작하거나, 동일 유스케이스를 **이벤트 비활성** 경로로 호출할 수 있다. |
| SC-8 | 기존 `POST /pipeline/run`은 **유지**한다(하위 호환). 신규 스트리밍 전용 엔드포인트를 추가하거나, 쿼리 플래그로 분기하는 방안 중 하나를 문서화한다. |

---

## 3. 권장 솔루션 (팀 결정)

### 3.1 옵션 비교

| 방식 | 장점 | 단점 |
|------|------|------|
| **A. SSE** (`text/event-stream`) | 구현 단순, 단방향에 적합, FastAPI `StreamingResponse`와 궁합 좋음 | `EventSource`는 GET만 네이티브; GET+쿼리로 `symbols` 전달 또는 POST 본문 불가 시 설계 제약 |
| **B. POST + NDJSON 청크** | 기존처럼 POST로 `symbols` 전달 가능 | 리버스 프록시·타임아웃 버퍼링 이슈, 클라이언트 스트림 파싱 구현 필요 |
| **C. Job + 폴링/WebSocket** | 재접속·히스토리 유리 | 저장소·만료 정책·구현 비용 큼 |

**권장(기본안):**  
- **POST + NDJSON 스트리밍** 또는 **SSE + GET + `symbols` 쿼리(콤마 구분, 길이 제한)** 중 하나를 채택.  
- 팀에 **SSE + 임시 run token** 패턴이 있으면 POST로 토큰 발급 후 `GET /pipeline/stream?token=` 도 가능.

### 3.2 최소 API 스펙 (초안)

**엔드포인트(예시 이름)**  
`POST /pipeline/run-stream`  
- Request: 기존과 동일 `RunPipelineRequest` + 쿠키  
- Response: `Content-Type: application/x-ndjson` 또는 `text/event-stream`  
- 각 줄(또는 SSE `data:`)은 JSON 객체 하나

**이벤트 공통 필드**

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `type` | string | ✓ | `progress` \| `result` \| `error` \| `done` |
| `at` | string (ISO8601) | ✓ | 서버 시각 |
| `message` | string | ✓ | UI 표시용 한국어/영문 문구 |
| `phase` | string | 권장 | `COLLECT` \| `NORMALIZE` \| `ANALYZE` |
| `symbol` | string | 조건부 | 종목 루프 시 |
| `source` | string | 조건부 | 수집기 식별자 |
| `progress` | object | 선택 | `{ "current": 1, "total": 3 }` 등 확장 |

**종료 이벤트**
- `type: "done"`: 기존 `POST /pipeline/run`과 동일한 `message`, `processed` 포함 가능  
- 또는 `type: "result"` 후 마지막에 `done`  
- `type: "error"`: `message`, 선택적으로 `symbol`, HTTP 상태와 별도로 스트림 내 설명

**인증**
- `POST /pipeline/run`과 동일한 `Cookie: account_id` 검증  
- 미인증 시 스트림 시작 전 401 (본문 없이)

---

## 4. 코드 변경 범위 (예상)

### 4.1 Application / Domain
- `RunPipelineUseCase.execute`  
  - 시그니처에 선택 인자 `on_event: Callable[[dict], Awaitable[None] | None] | None` 또는 `AsyncIterator` 패턴 도입  
  - 종목 루프 진입 전·수집 전후·정규화 전후·분석 전후에 `on_event` 호출
- `CollectArticlesUseCase`  
  - Collector **개별 호출** 전후에 `source` 단위 이벤트 (Dart / NewsCollectorAdapter / Finnhub / Naver 순서는 라우터의 `collectors` 리스트 순서와 일치)

### 4.2 Adapter (Inbound)
- `pipeline_router.py`  
  - `StreamingResponse`로 제너레이터/async generator 연결  
  - DB 세션 수명: 스트리밍 전체 구간 동안 세션 유지 vs 종목마다 커밋 — **트랜잭션 경계** 결정 필요  
  - 기존 `_summary_registry` 갱신·`log_repo.save_all`은 **스트림 완료 직전** 기존 로직과 동일하게 실행

### 4.3 비기능
- Uvicorn/Gunicorn worker 타임아웃 > 최대 파이프라인 시간  
- Nginx 사용 시 `proxy_buffering off`, `proxy_read_timeout` 조정 가이드를 README에 추가

---

## 5. 테스트 / 검증

- [ ] 단일 종목 실행 시 이벤트 순서가 `COLLECT` → `NORMALIZE` → `ANALYZE` 대략 순으로 관측됨  
- [ ] Collector 4종이 모두 등록된 경우(현재 라우터 기준) 소스별 이벤트가 최소 1회 이상 발생(스킵 시에도 `skipped` 메시지 이벤트)  
- [ ] OpenAI 실패 시 `error` 이벤트 후 연결 종료  
- [ ] `account_id` 없을 때 401  
- [ ] 기존 `POST /pipeline/run` 단위/통합 테스트 회귀 없음

---

## 6. Todo (체크리스트)

1. [ ] 전송 방식 확정(SSE vs NDJSON POST vs Job) 및 프록시 타임아웃 정책 합의  
2. [ ] 이벤트 JSON 스키마를 OpenAPI 또는 `docs/` 예시로 고정  
3. [ ] `RunPipelineUseCase` + 수집 유스케이스에 훅 삽입  
4. [ ] `pipeline_router` 스트리밍 엔드포인트 구현 및 기존 `POST /run` 유지  
5. [ ] 스케줄러 경로는 이벤트 없이 `execute(..., on_event=None)`  
6. [ ] 프론트 `BL-FE-29`와 연동 검증(로컬 E2E)

---

## 7. 관련 백로그 / 의존성

- **BL-BE-11**: Finnhub / 네이버 수집기 — `source` 이벤트 값과 매핑 테이블 유지  
- **BL-BE-07 / BL-BE-08**: 분석 로그 영속화·사용자별 격리 — 스트림 완료 후 저장 로직 유지  
- **BL-FE-29** (프론트): 단일 CTA + 진행 UI + 스트림 소비

---

## 8. 비고 / 비목표

- WebSocket은 1차 범위에서 제외 가능(필요 시 별도 백로그)  
- “진행률 %”는 소스·기사 수를 알기 전까지 부정확할 수 있으므로 1차는 **단계 문구 + 선택적 n/m** 정도로 제한 가능

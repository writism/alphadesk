# 2026-04-21 리팩토링 리뷰

> 대상: [REFACTORING-20260421-PERF-AND-TYPES.md](./REFACTORING-20260421-PERF-AND-TYPES.md)
> 리뷰 일자: 2026-04-21
> 리뷰어: AI 코드 리뷰어 (Claude Opus 4.7)
> 리뷰 범위: 이번 커밋에 포함된 변경 + 그 직후 "미완료 항목" 요약의 정확성

---

## 1. 한 줄 총평

**핵심 목표(이벤트 루프 블로킹 제거 · 멀티 워커 안전 · 타입 경계) 를 최소 침습으로 달성했고, 각 변경이 독립 머지 가능한 단위로 쪼개져 있어 리스크가 낮다.** 다만 (a) 관측 지표 부재, (b) 호환성 가드 부족, (c) "미완료 항목" 요약의 일부 과대·과소 평가가 남아있다. 아래에서 항목별로 평가한다.

---

## 2. 항목별 리뷰

### 2.1 OpenAI async 전환 ✅ Good

**변경**: 5개 어댑터 `OpenAI` → `AsyncOpenAI` + `await`.

**평가**:
- 포트 계약(`ArticleAnalyzerPort.analyze` 등)이 이미 `async def` 였으므로 호출부 변경 없이 구현체만 교체한 것은 **정확한 의존성 방향**이다. 헥사고날 의도가 잘 유지되었다.
- 예외 처리(`try/except` 로 감싸 fallback 반환) 로직이 보존되어 있어 기능 회귀 위험이 낮다.

**아쉬운 점 / 제안**:
- `AsyncOpenAI` 인스턴스가 **어댑터당 하나씩 생성**된다. 도메인별로 서로 다른 `api_key` 가 주입되므로 이 설계 자체는 문제 없지만, 같은 키를 쓰는 다수 어댑터가 동시에 연결을 늘리는 패턴이 될 수 있다. 장기적으로는 `httpx.AsyncClient` 를 공유 주입하는 형태(`AsyncOpenAI(http_client=shared_client)`) 를 고려할 만하다.
- `infrastructure/llm/openai_responses_client.py` 는 sync 유지로 결정되었는데, "호출측에서 `run_in_threadpool` 로 감싼다" 는 규약이 **코드에 주석·데코레이터·린트**로 강제되지 않는다. 향후 누가 async 핸들러에서 이 port 를 직접 await 없이 호출하는 회귀를 막기 어렵다. 최소한 port 인터페이스에 `# NOTE: sync — wrap with run_in_threadpool in async callers` 주석이라도 박아야 한다.

### 2.2 `/news/search` 스레드풀 + SerpClient 공유 ✅ Good, with caveats

**변경**: `run_in_threadpool(usecase.execute)` + `SerpClient._shared_client` (max_connections=20).

**평가**:
- 가장 비용 대비 효과가 큰 변경. SERP API 호출마다 TLS 재협상하던 지점이 제거되었다.

**아쉬운 점 / 제안**:
- `SerpClient._shared_client` 가 **class-level singleton** 인데, 프로세스 종료 시 `client.close()` 훅이 없다. 테스트에서 fixture 단위로 생성/파괴가 어렵고, 장기 운영 중 리소스 누수 관측이 애매해진다. `atexit.register(cls._shared_client.close)` 또는 FastAPI `lifespan` 종료 훅에 정리 로직을 거는 편이 안전하다.
- `max_connections=20` 은 경험값으로 설정되어 있다. **configurable** 하게 만들어 `settings.serp_max_connections` 로 빼두는 것이 운영 튜닝에 유리하다.
- threadpool 오프로드로 라우트는 안전해졌지만, `usecase.execute` 내부에서 여전히 동기 `time.sleep` / 블로킹 호출이 섞여있다면 기본 threadpool 용량(기본 40) 이 병목이 될 수 있다. 부하 테스트 후 필요하면 `anyio.to_thread.run_sync(..., limiter=...)` 로 상한 관리 권장.

### 2.3 Pipeline 상태 Port/Adapter (Redis + in-memory) ✅ Excellent

**변경**: `ProgressStorePort`/`SummaryRegistryPort` + in-memory/Redis 어댑터 + 팩토리.

**평가**:
- 이번 리팩토링의 **가장 잘 된 변경**. 헥사고날 원칙에 따른 경계 신설 + 설정 기반 폴백 + Redis PING 실패시 graceful 다운그레이드 — 교과서적인 구성이다.
- `redis.pipeline()` 을 쓴 append + expire 원자 실행, TTL 차등(summary 24h / progress 1h) 도 합리적이다.

**아쉬운 점 / 제안**:
- **싱글턴 race**: `factory.py::get_summary_registry` 는 락 없이 `_summary_registry is None` 체크 후 할당한다. FastAPI lifespan 전 또는 첫 요청 시 동시에 여러 워커 쓰레드가 들어오면 `_build_backends()` 가 중복 실행되어 **Redis PING 이 두 번 일어날 수 있다**. 기능 문제는 없지만, `threading.Lock` 또는 애플리케이션 기동 시 eager 초기화(lifespan startup) 가 더 방어적이다.
- **예외 무기력(silent)**: Redis append 실패 시 `warning` 만 로그하고 조용히 폐기한다. 지금 도메인에서는 허용 가능하지만, **운영 대시보드에서 이 실패율을 집계할 계측**이 없다. Prometheus counter 한 줄(`redis_progress_append_failures_total`) 추가를 권장.
- **키 설계**: `account_id` 가 `None` 일 때 `'anon'` 하드코딩. 테스트 계정·비인증 플로우가 섞이면 **모든 익명 세션이 같은 키를 공유**한다. 현재 라우터가 인증된 account 에서만 쓰이는지 재확인 필요. 그렇지 않다면 session_id 기반 키 분리가 필요하다.
- **테스트**: in-memory 어댑터가 제공되므로 단위 테스트에서 Redis fake 없이 검증 가능해졌지만, 실제 **port contract 를 검증하는 shared test suite** 가 없다. `tests/pipeline/test_progress_store_contract.py` 로 두 어댑터 모두에 같은 케이스를 돌리는 parametrized 테스트를 추가하면 회귀 안전장치가 된다.

### 2.4 `_analyze_single_best` 병렬화 ✅ Good, 상한 튜닝 필요

**변경**: `asyncio.gather` + `Semaphore(4)`.

**평가**:
- 기사별 독립 처리라는 특성에 맞는 단순한 전환. 기존 best 선택 로직(confidence 최대) 은 순차 그대로 유지하여 결정성이 보존된다.

**아쉬운 점 / 제안**:
- `_SINGLE_BEST_CONCURRENCY = 4` 가 **모듈 레벨 상수**로 박혀있다. OpenAI tier / DB 풀 크기에 따라 최적값이 다르므로 `settings.pipeline_single_best_concurrency` 로 빼는 것이 바람직하다.
- 개별 기사 실패(`Exception`) 가 `gather(..., return_exceptions=True)` 로 수집되는지, 혹은 하나 실패하면 전체가 실패하는지 **소스 확인 필요**. `return_exceptions=True` + 개별 결과의 `isinstance` 체크로 부분 실패를 허용하는 패턴이 안전하다.
- 세마포어가 `_analyze_single_best` 내부에서 매 호출마다 새로 생성되면(위치에 따라) **심볼간 동시성 상한이 의도보다 느슨**해진다. 심볼 루프에서 공용으로 쓰이도록 한 단계 위로 올리는 편이 정책 일관성이 높다.

### 2.5 `RunPipelineResult` Pydantic 모델 ✅ Good, but API boundary 는 미완

**변경**: `execute() -> RunPipelineResult` (Pydantic). 라우터는 속성 접근으로 전환.

**평가**:
- 유즈케이스 반환 타입이 **코드로 문서화**되어 IDE/pyright 양쪽에서 계약이 노출된다. 이번 스코프에서 최우선이던 개선.

**아쉬운 점 / 제안**:
- `POST /pipeline/run` 에 **`response_model` 이 지정되지 않았다** (소스 확인: 163·174·185 라인의 `GET` 라우트만 response_model 사용). 즉 `RunPipelineResult` 의 일부 필드만 손으로 추려 `{message, processed}` 형태로 반환한다. **API 계약과 유즈케이스 계약이 분리되어 있는 것은 의도적으로 좋지만**, 지금은 그 "응답 DTO" 가 명시되지 않아 클라이언트 타입 생성 파이프라인이 짝을 맞출 근거가 없다. `RunPipelineResponse` DTO 를 라우터 쪽에 추가하고 `response_model` 을 걸어야 완결된다.
- `ProcessedItem`/`RunPipelineResult` 의 필드에 **docstring 또는 `Field(description=...)` 이 없다**. 로그/DTO 공용 모델로 자랄 가능성이 있으므로 설명을 추가하는 편이 OpenAPI 품질에 직접 기여한다.

### 2.6 pyright + CI typecheck ⚠️ 방향은 맞지만 실효성 약함

**변경**: `pyproject.toml` 에 `typeCheckingMode = "basic"`, CI 잡 추가(`continue-on-error: true`).

**평가**:
- 단계적 도입 의도는 이해된다. 갑자기 strict 를 켜면 수백 건 오류가 쏟아져 실제 수정 없이 문서만 쌓이는 상황을 피한 것은 현실적이다.

**아쉬운 점 / 제안**:
- **`continue-on-error: true` + `basic`** 조합은 사실상 **경고만 수집**하는 수준이라, 새 회귀가 들어와도 PR 이 빨간불이 되지 않는다. 이 상태가 오래 지속되면 문서상 "타입 체커 있음" 이지만 **실제로는 무시되는** 흔한 안티패턴으로 굳는다. 다음 둘 중 하나를 제안:
  1. **디렉터리 화이트리스트 strict**: `app/domains/pipeline/**`, `app/domains/stock_analyzer/application/**` 처럼 **깨끗한 레이어만 strict** 로 두고, CI 를 fail 로 전환. 신규 코드는 strict 영역에 쓰도록 유도.
  2. **baseline 관리**: `pyright --outputjson` 을 저장소에 커밋한 베이스라인과 비교하여 **신규 오류만 실패**로 처리. (간단히 `diff` 로도 가능)
- `requirements.txt` 를 CI 에서 설치해 import 해석을 시키는 방식은 **느리다**. 자주 바뀌는 deps 는 캐시(`actions/setup-python` 의 `cache: pip`) 를 반드시 걸어야 한다. 지금 워크플로에 캐시가 없다면 추가가 필요하다.

### 2.7 `log_context` 일원화 · 스케줄러 직접 호출 · `session_scope` ✅ Good

**변경**: 도메인 `log_context` 를 infra re-export 로 축소, `run_pipeline_job` 이 유즈케이스 직접 호출, 컨텍스트 매니저 도입.

**평가**:
- 세 변경 모두 "HTTP 는 HTTP 에만" 원칙을 복원하고, 자원 수명을 컨텍스트 매니저로 보장한다. 레이어 규율 회복 차원에서 긍정적이다.

**아쉬운 점 / 제안**:
- `log_context.py` 가 re-export 용 **얇은 shim** 으로 남았다. 과도기에는 유용하지만, 도메인 코드가 `from app.domains.investment.adapter.outbound.agent.log_context import aemit` 를 계속 쓰면 **shim 이 영구화**된다. 단기(다음 PR) 에 grep 으로 import 경로 일괄 교체 후 shim 파일 삭제까지 가야 정리가 완결된다.
- `session_scope()` 는 좋지만, **FastAPI `Depends(get_db)` 경로와 혼재**한다. 스타일 가이드에 "요청 경로는 Depends, 스케줄러/배치/헬퍼는 `session_scope`" 라는 한 줄 규칙을 `CLAUDE.md` 또는 `AGENTS.md` 에 명문화해야 코드 리뷰가 일관된다.

### 2.8 Frontend 타입 경계 (`requestJson<T>` · non-null assertion 제거) ✅ Good

**변경**: 헬퍼 도입, hot path 일부 적용, `!` 5건 제거.

**평가**:
- `board/read/[id]/page.tsx` 의 `linkedCardId!` 제거처럼 **조용한 런타임 버그를 예방**하는 전형적 개선. `fetchHeatmapForSymbol` 의 옵셔널 체인화도 좋은 방어.

**아쉬운 점 / 제안**:
- `requestJson<T>` 의 기본 경로는 `parse` 미제공 시 `raw as T` 로 **타입 단언만** 한다. 이는 기존 `as T` 코드와 타입 안전성이 동등하며, **런타임 검증이라는 본래의 가치를 얻으려면 zod/valibot 스키마와 결합**해야 한다. 최소한 `features/auth` 같은 민감 응답부터 parser 를 붙이는 후속 PR 을 권장한다.
- 미도입 영역이 많은데(`features/*/infrastructure/api/*.ts`), 에디터 ruleset 으로 **"`fetch(` 직접 호출 금지, `requestJson` 사용"** lint 규칙(`no-restricted-syntax`) 을 넣어두면 점진적 수렴이 자동화된다.

### 2.9 Frontend 성능 (memo · dynamic import) ✅ Pragmatic

**변경**: `NewsItem` memo, `StockSummaryCard`/`ShareActionBar` `next/dynamic`.

**평가**:
- 리스트 render 비용 완화와 board/read 페이지 초기 JS 크기 감소에 **직접 기여**. 무거운 차트/공유 UI 를 lazy 하는 것은 모바일 LCP 관점에서 확실한 개선이다.

**아쉬운 점 / 제안**:
- **측정이 없다**. Before/After 번들 사이즈(`next build --profile` 혹은 `@next/bundle-analyzer`) 와 LCP/INP 수치가 없으면 이 변경의 가치를 커뮤니케이션할 근거가 얇아진다. 후속 PR 에서 수치를 첨부해야 "성능 리팩토링" 이라는 타이틀이 유지된다.
- `NewsItem` 만 `memo` 를 적용했는데, 같은 패턴을 쓰는 다른 리스트(`DashboardSummaryList`, `WatchlistList`, `RecommendationList` 등) 에도 동일 판단이 필요한지 빠르게 조사해 **일관 적용하거나 의도적으로 제외**하는 결정을 문서화해야 한다.
- `next/dynamic` 으로 lazy 된 컴포넌트의 `ssr` 옵션 설정 여부가 리포트에 명시되지 않았다. `ShareActionBar` 가 `navigator.clipboard` 등 브라우저 API 를 쓴다면 `ssr: false` 가 맞지만, `StockSummaryCard` 는 LCP 대상일 수 있어 **SSR 유지 + suspense boundary** 가 더 나을 수도 있다. 재확인 필요.

---

## 3. "미완료 항목" 요약의 정확성 검증

직전 대화에서 요약된 "아직 미완료" 목록을 실제 코드와 대조했다.

| 요약 | 실제 상태 | 판정 |
|---|---|---|
| FE 인증 상태 이중화 (`store/authAtom` vs `features/auth/.../authAtom`) | 두 모듈 공존, 12개 이상 참조 | ✅ 정확 |
| FE SWR 통일 (watchlist/news/dashboard/youtube) | `dashboard`, `youtube`, `share` 는 **이미 `useSWR` 사용**. 나머지 hook 은 직접 fetch 혼재 | ⚠️ 과대 — "일부는 이미 완료, 나머지 수렴 필요" 가 정확 |
| BE MySQL migration (`create_all` + `_run_column_migrations` → Alembic) | `alembic_mysql/versions/` 에 3개 리비전, baseline/runbook 문서 존재. `main.py:69` 에 남은 `create_all` 은 **MySQL 이 아닌 PostgreSQL (`PgBase`)**. `_run_column_migrations` 호출 코드는 **이미 제거됨** | ❌ 오류 — MySQL 은 거의 완료, 남은 것은 "PG `create_all` 제거 + MySQL 최종 cutover" |
| BE pyright strict 승격 | 현재 basic + `continue-on-error` | ✅ 정확 |
| FE `requestJson<T>` 전체 마이그레이션 | hot path 중 dashboard 등 소수만 반영 | ✅ 정확 |
| FE ClientShell 경계 축소 | 미착수 | ✅ 정확 |
| 벤치마크 · e2e | 미실행 | ✅ 정확 |

**결론**: 요약의 **완료 목록은 100% 정확**하지만, **미완료 목록에서 MySQL migration 항목을 "미완료"로 분류한 것은 명백한 오류**, **SWR 항목은 표현 다듬기 필요** 이다. 리팩토링 리포트의 "후속 작업" 절에도 이 정정을 반영해두는 편이 좋다.

---

## 4. 내가 가장 우려하는 3가지 (우선순위 순)

1. **pyright 가 실질적으로 무력한 상태로 고착될 위험**
   - `continue-on-error: true` + `basic` 은 1~2 주 뒤 팀 모두 무시하는 배지(badge) 가 된다. 이번 주 안에 **(a) strict 디렉터리 화이트리스트로 전환하여 CI fail** 로 바꾸거나, **(b) 베이스라인 diff 체크**로 바꾸어야 한다. 그렇지 않으면 이 투자에서 ROI 를 회수할 수 없다.

2. **관측/측정의 부재**
   - OpenAI 전환, SERP 풀링, 파이프라인 병렬화, 프론트 dynamic import — 모두 "더 빨라졌을 것" 이지만 **수치가 없다**. 최소한 다음 세 가지 수치는 다음 PR 에서 첨부하자:
     - `/news/search` p50/p95 (로컬 부하기)
     - 파이프라인 5심볼 end-to-end 초 단위 (캐시 무효 조건)
     - board/read 초기 JS 전송량 (next/bundle-analyzer)
   - "성능 리팩토링 PR 에 수치가 없다" 는 것은 리뷰 단계에서 가장 뼈아프게 지적되는 항목이다.

3. **멀티 워커 전환 시 `anon` 키 · 싱글턴 race 의 꼬리 리스크**
   - Redis 상태 어댑터가 동작 **가능** 한 것과 **프로덕션 다중 워커에서 안전** 한 것은 별개다. 첫 `--workers 2` 배포 직전에 위 2.3 절의 (a) 싱글턴 락, (b) 익명 키 분리 두 가지는 점검하자. 지금 발견하면 코드 5줄, 프로덕션에서 발견하면 세션 간 데이터가 섞이는 장애가 된다.

---

## 5. 칭찬할 점

- **변경 단위가 작고 독립적**이다. `p0` ~ `p7` 이 각각 다른 PR 로도 서 있을 수 있게 쪼개진 것은 이번 작업의 구조적 미덕이다.
- **Port/Adapter 경계를 기회로 활용**했다. 단순히 Redis 를 밀어넣는 것이 아니라 port 를 먼저 만들고 두 어댑터로 구현한 것은 장기적으로 테스트 용이성/교체성에서 배당을 만들어낸다.
- **하위 호환 유지에 대한 감수성** 이 있다. Redis 없는 개발 환경 폴백, 스케줄러의 유즈케이스 직접 호출 전환 시 기능 회귀 방지, OpenAI sync 포트 보존 — 모두 "현장에서 깨뜨리지 않는" 선택이었다.

---

## 6. 다음 PR 을 연다면 가장 먼저 할 일 (우선순위 권장)

1. **pyright 를 진짜로 게이팅하게 만들기** — strict 화이트리스트 or baseline diff. (반나절)
2. **측정값 첨부** — `/news/search` 와 board/read 번들 사이즈 전/후. (반나절)
3. **`PgBase.metadata.create_all()` 제거 + PG Alembic cutover 마무리** — 이번 요약에서 "MySQL 미완료" 로 잘못 분류된 실제 미완 항목. (1~2일)
4. **Redis 어댑터 계약 테스트 + 싱글턴 락** — `tests/pipeline/test_state_store_contract.py`. (반일)
5. **`requestJson<T>` 일괄 마이그레이션 + `no-restricted-syntax` lint** — 점진 수렴 자동화. (1일)
6. **FE 인증 상태 단일화** — `store/authAtom` 을 `features/auth` 쪽으로 수렴. deprecation shim + 마이그레이션. (1~2일)

---

## 7. 요약 한 장

- **점수(주관적)**: 8/10
- **잘한 것**: 포트/어댑터 신설, 최소 침습, 독립 머지 가능 단위
- **부족한 것**: 측정값 · 타입 체커 게이팅 · 후속 정리(shim 제거 · `response_model`) · 테스트 계약
- **고쳐야 할 요약 오류**: MySQL migration 은 이미 대부분 완료, 실제로 남은 건 PG `create_all` 제거
- **다음 한 주 집중해야 할 것**: pyright 게이팅 + 성능 수치화 + 멀티 워커 배포 전 점검 2종

---

## 8. 보충 의견 — 코드 직접 확인 기반 (Claude Sonnet 4.6, 2026-04-21)

> 이 섹션은 `REFACTORING-AUDIT-20260418.md` 및 `REFACTORING-PHASE1-EXECUTION-PLAN.md` 를 함께 대조하여 도출한 전략적 관점이다. 위 리뷰(섹션 2~7)의 기술적 항목 평가는 유효하며 여기서는 중복하지 않는다.

### 8.1 가장 큰 문제: Phase 순서 역전

`REFACTORING-PHASE1-EXECUTION-PLAN.md` 는 Phase 1 을 다음 세 축으로 정의했다.

1. **FE 인증/세션 상태 단일화** (Track A)
2. 운영/배포 기준선 정리 (Track B)
3. BE MySQL 마이그레이션 체계 전환 준비 (Track C)

오늘 실행된 `REFACTORING-20260421-PERF-AND-TYPES.md` 는 이 중 **어느 트랙도 완료하지 않았다.** 내용상으로는 Audit 문서의 P0~P7 분류 중 P1 이후(파이프라인 상태 저장소, 병렬화, 타입, 성능)에 해당한다.

즉 현재 상황은 다음 구조다.

```
[AUDIT 04-18] → [PHASE1 PLAN 04-18] → [PERF/TYPES 실행 04-21]
                       ↑                         ↑
               Phase 1 목표 정의        Phase 1 이 아닌 작업 먼저 실행
```

이 자체가 잘못은 아닐 수 있다. 그러나 **명시적으로 선언하지 않은 순서 변경** 이라는 점은 짚고 넘어가야 한다.

### 8.2 순서 역전의 실질적 위험

Audit 문서가 Phase 1 Track A(FE 인증 단일화)를 가장 먼저 두었던 이유가 있다.

> "이 문제는 구조적 버그이자 리팩토링 1순위다."
> — REFACTORING-AUDIT-20260418.md 4-1-A

FE 인증 이중 구조(`store/authAtom` vs `features/auth/.../authAtom`) 는 현재 코드베이스에 그대로 남아 있다. `logout()` 이 두 atom 을 동시에 업데이트하지 않는 문제도 미해결이다.

이 상태에서 watchlist/news/dashboard 데이터 패칭을 SWR 로 전환하면, SWR 캐시 무효화 타이밍이 auth 상태 불일치와 교차되는 새로운 엣지 케이스가 생길 수 있다. **Phase 2 작업이 Phase 1 버그 위에 쌓이는 구조** 다.

### 8.3 현재 코드에서 직접 확인한 미완료 상태

오늘 upstream merge 후 FE 기준:

- `store/authAtom.ts` — 여전히 존재, 단순 문자열 상태
- `features/auth/application/atoms/authAtom.ts` — 별도 존재, `status + user` 구조
- `components/AuthProvider.tsx` — 두 atom 을 동시에 초기화하는 구조 그대로

BE 기준:

- `alembic_mysql/versions/` — 3개 리비전 존재, MySQL 전환 대부분 완료
- `main.py` — `PgBase.metadata.create_all()` 는 남아 있음 (MySQL `create_all` 은 이미 제거됨)

이는 섹션 3의 미완료 목록 중 **MySQL migration 항목이 오분류** 라는 기존 리뷰의 지적을 실제 코드로 재확인한 것이다.

### 8.4 추가로 지적할 미완료: FE SWR 통일의 실제 범위

섹션 3 에서 "dashboard, youtube, share 는 이미 useSWR 사용" 이라고 했다. 이는 맞다. 그러나 현재 upstream merge 후 기준으로 다음 backlog 가 여전히 열려 있다.

- `BL-FE-66` — SWR global provider
- `BL-FE-67` — SWR dashboard cache
- `BL-FE-68` — SWR youtube cache

즉 "useSWR 를 쓰고 있다" 와 "SWR 전략이 통일되어 있다" 는 다르다. **캐시 키 설계, revalidation 정책, mutate 기준이 feature 마다 다르다** 는 문제는 아직 열려 있다.

### 8.5 다음 작업 권장 순서 (전략 관점 재정렬)

위 기술 리뷰의 섹션 6 은 기술 단위별 우선순위다. 여기서는 **각 작업의 의존성과 독립성을 기준으로 한 전략 순서** 를 별도로 제안한다.

**독립적으로 진행 가능한 것 (병렬 가능):**

| 작업 | 이유 |
|---|---|
| pyright CI 게이팅 실질화 | 시간이 지날수록 관성적으로 무시됨. 이번 주가 마지막 기회 |
| PG `create_all` 제거 + PG Alembic cutover | auth 와 무관. 배포마다 암묵적 스키마 변경 위험 제거 |
| Redis 어댑터 계약 테스트 + 싱글턴 락 | 멀티 워커 배포 전 필수. auth 와 무관 |
| 성능 수치화 (벤치마크 첨부) | 이미 실행한 작업의 가치 증명 |

**auth 상태에 의존하는 작업을 시작하기 전에 선행되어야 하는 것:**

| 작업 | 이유 |
|---|---|
| FE 인증 atom 단일화 | SWR 캐시 키가 auth 상태와 결합되는 순간, 이중 구조가 새 엣지 케이스를 만든다 |
| → 이후: SWR 전략 통일 (캐시 키 + revalidation 규칙) | auth 가 단일화된 이후에 안전하게 진행 가능 |

즉, **auth 단일화 자체가 "다음 PR 1순위"인 것이 아니라**, SWR 전환처럼 auth 상태에 의존하는 작업을 시작하기 전에 완료되어 있어야 한다는 선행 조건이다.

### 8.6 한 줄 결론

> 오늘 실행한 변경의 **기술적 품질은 높다**. 다만 계획 문서와의 순서가 어긋났고, FE 인증 이중 구조는 **auth 상태에 의존하는 후속 작업(SWR 전환 등)을 시작하기 전에** 정리되어야 한다. pyright 게이팅, PG migration cutover, Redis 테스트는 auth 와 무관하므로 병렬로 진행해도 무방하다.

---

### 8.7 코드 직접 확인으로 수정해야 할 진단 오류

**이 섹션은 Audit/Phase1 문서의 전제를 실제 코드로 검증한 결과다.**

#### A. FE auth "P0 버그"는 실제로 존재하지 않는다

Audit 문서와 Phase1 계획이 전제한 "이중 상태 불일치" 문제를 코드로 확인했다.

`alpha-terminal-frontend/store/authAtom.ts`:
```ts
export const authAtom = atom<AuthState>((get) => get(authStateAtom).status);
export const isAuthenticatedAtom = atom((get) => get(authAtom) === "AUTHENTICATED");
```

`store/authAtom.ts` 는 **독립 상태가 아니라 derived atom** 이다. `authStateAtom` 이 바뀌면 자동으로 따라간다. 쓰기가 불가능한 read-only 파생이다.

`useAuth.logout()` 도 확인했다:
```ts
} finally {
    setState({ status: "UNAUTHENTICATED" })
}
```

`setState` 는 `authStateAtom` 을 직접 업데이트한다. `authAtom` 은 derived 이므로 즉시 동기화된다. **두 atom 이 따로 노는 상황은 현재 코드에서 발생하지 않는다.**

결론:
- `store/authAtom.ts` 는 **중복·불필요**하지만 버그가 아니다
- P0 분류는 과장됐다
- 이 파일은 SWR 전환 전이 아니어도 언제든 정리 가능한 cleanup 수준이다

---

#### B. 실제로 필요한 리팩토링 — 코드에서 확인한 것만

**1. PG `create_all` 제거 (BE, 실제 위험)**

`main.py:69`:
```python
PgBase.metadata.create_all(bind=pg_engine)
```

앱 시작마다 PostgreSQL 에 `create_all` 이 실행된다. `except` 가 있어서 PG 가 없으면 넘어가지만, PG 가 연결되면 SQLAlchemy 가 판단하는 스키마 변경을 조용히 적용한다. **운영 DB 에 의도치 않은 컬럼·테이블이 생성될 수 있다.** Alembic 으로 관리되는 MySQL 과 달리 PG 는 이력과 롤백이 없다.

MySQL `create_all` 은 이미 제거됐고, PG 이것만 남았다. Alembic PG migration 으로 전환 후 이 줄을 제거하는 것이 필요하다.

**2. `SerpClient._shared_client` lifecycle 누락 (BE, 경미하지만 실재)**

`serp_client.py`:
```python
_shared_client: httpx.Client | None = None

@classmethod
def _get_client(cls) -> httpx.Client:
    if cls._shared_client is None:
        cls._shared_client = httpx.Client(...)
    return cls._shared_client
```

`close()` 훅이 없다. 프로세스 종료 시 OS 가 정리하지만, **테스트 간 격리가 안 되고 FastAPI lifespan 과 수명 주기가 불일치**한다. `lifespan` shutdown 에 `SerpClient._shared_client.close()` 한 줄 추가로 해결된다.

**3. `store/authAtom.ts` 파일 자체 제거 (FE, 버그 아님, cleanup)**

버그는 아니지만 이 파일이 존재함으로써:
- 11개 파일이 `authStateAtom` 을 직접 쓰고 일부는 `authAtom` 을 쓰는 혼재 상태가 된다
- `isAuthenticatedAtom` 을 쓸 이유가 있는 컴포넌트가 `store/` 를 바라보게 된다 (아키텍처 규칙 위반 — `app/` 과 `features/` 는 `store/` 를 참조하면 안 된다)

`authAtom` 과 `isAuthenticatedAtom` 을 `features/auth/application/selectors/` 로 이동하고 `store/authAtom.ts` 를 삭제하면 끝난다.

---

#### C. 리팩토링 불필요하다고 판단한 것

- **auth 이중 구조 자체**: derived atom 구조라 실제 불일치 없음. cleanup 수준
- **ClientShell 경계 축소**: 현재 규모에서 측정 가능한 개선 불투명
- **SWR 전체 통일**: 중복 호출이 실제 사용자에게 영향 주는지 계측 먼저 필요

---

### 8.8 최종 결론

이 문서(Audit + Phase1 + Review) 에서 가장 큰 문제는 **진단이 코드 확인 없이 작성된 부분이 있다**는 것이다. auth P0 버그가 대표적이다. "구조가 이중으로 보인다" → "불일치 버그가 있을 것이다" 로 건너뛴 추론이 Phase1 전체 실행 순서에 영향을 줬다.

실제로 지금 코드에서 필요한 리팩토링은 세 가지다.

| 항목 | 긴급도 | 이유 |
|---|---|---|
| PG `create_all` 제거 | 높음 | 배포마다 암묵적 스키마 변경, 롤백 불가 |
| `SerpClient` lifecycle | 낮음 | 테스트 격리 + lifespan 정합성 |
| `store/authAtom.ts` 삭제 | 낮음 | 아키텍처 규칙 위반 정리 |

---

## 9. 재-리뷰 — 섹션 8 에 대한 반론과 보강 (Claude Opus 4.7, 2026-04-21 2차)

> 섹션 8 (Claude Sonnet 4.6 작성) 의 내용을 실제 코드로 재검증했다. 맞는 부분과 틀린/과도한 부분이 섞여 있어 교통정리 필요.

### 9.1 섹션 8.7 A ("auth P0 버그는 존재하지 않는다") — **부분 동의**

실제 코드 확인 결과:

```6:8:alpha-terminal-frontend/store/authAtom.ts
export const authAtom = atom<AuthState>((get) => get(authStateAtom).status);

export const isAuthenticatedAtom = atom((get) => get(authAtom) === "AUTHENTICATED");
```

```16:24:alpha-terminal-frontend/features/auth/application/hooks/useAuth.ts
const logout = useCallback(async () => {
    try {
        await logoutUser()
    } catch {
        // 백엔드 실패(401 등)와 무관하게 로컬 상태는 항상 초기화
    } finally {
        setState({ status: "UNAUTHENTICATED" })
    }
}, [setState])
```

**섹션 8.7 A 의 사실 관계는 정확하다**:
- `store/authAtom` 은 독립 atom 이 아니라 `authStateAtom` 의 **derived read-only atom** 이다.
- `setState(authStateAtom, ...)` 한 번으로 `authAtom` · `isAuthenticatedAtom` 이 자동 동기화된다.
- "두 atom 이 따로 노는" 고전적 이중 상태 버그는 구조상 발생하지 않는다.

**다만 섹션 8.7 A 의 결론("P0 분류는 과장됐다")에는 부분적으로만 동의한다.** Audit 문서가 "P0" 로 분류한 의도는 "동기화 실패 버그" 뿐 아니라 다음 네 가지를 합친 것으로 봐야 한다:

1. **아키텍처 경계 위반**: `store/` → `features/auth/application/atoms/` 역방향 import (`store/authAtom.ts:2`). 레이어 방향이 뒤집혀 있다. 이건 derived 여부와 무관한 **구조적 결함**이다.
2. **참조 분산**: `store/authAtom` 과 `features/auth/application/selectors/authSelectors.ts` 의 selector 가 양쪽에 존재하여 신규 컴포넌트가 어느 쪽을 import 할지 고민하게 된다. 코드 리뷰 시 매번 튕겨나오는 비용이 있다.
3. **리팩토링 지뢰**: `authStateAtom` 의 `status` 필드 구조(유니온 리터럴)가 바뀌면 derived 쪽이 조용히 깨진다. 타입으로 잡히긴 하지만, "derived 의 의미" 가 바뀔 위험이 있다(예: `PENDING_TERMS` 를 인증으로 취급할지 등).
4. **SWR 전환 시 표면화**: auth key 가 SWR 캐시 키에 섞이면 `store/` 쪽 import 도 함께 밀려나간다.

즉 **버그가 아니라 부채** 다. "P0" 라는 라벨은 과장이지만 "낮음 / 언제든 cleanup" 도 살짝 낮게 평가했다. **"중간 우선순위의 아키텍처 정리"** 가 정확한 온도라고 본다.

### 9.2 섹션 8.1~8.2 ("Phase 순서 역전") — **동의하지 않는다**

섹션 8 은 "Phase 1 계획은 FE auth → 운영/배포 → MySQL 이었는데, 실제로는 그 어느 것도 안 건드리고 P1~P7 을 먼저 했다" 고 지적한다. 그러나:

1. **Phase 1 문서가 확정 계획이 아니라 "제안" 이었을 가능성** — 원본 `REFACTORING-PHASE1-EXECUTION-PLAN.md` 가 어떤 의결 과정을 거쳤는지, 이번 실행 PR 이전에 무효화 또는 재우선순위 결정이 있었는지 이 리뷰에서 확인되지 않았다. "계획 문서가 있으니 그 순서대로 해야 한다" 는 전제 자체가 조직 컨텍스트 없이 내려진 판단이다.
2. **실행 스코프가 명시적으로 "perf · types"** — 오늘 작업의 트리거는 "전체 소스 리팩토링" → 사용자가 명시적으로 `scope=fe_be, goal=perf, types` 로 좁혔다. Phase1 plan 의 auth 트랙(Track A)은 **scope/goal 에 해당하지 않는다**. 즉 "순서 역전" 이 아니라 "의도적으로 다른 스코프의 작업을 수행한 것" 이다.
3. **auth 가 SWR 의존작업 블로커라는 주장의 강도** — 섹션 8.2 는 "SWR 전환 시 auth 불일치와 교차 엣지 케이스가 생긴다" 고 한다. 하지만 방금 9.1 에서 확인했듯 **불일치 자체가 구조상 발생하지 않는다**. 따라서 SWR 전환의 선행 조건이라는 논리는 약하다.

**결론**: 섹션 8.1~8.2 는 **논지가 과하다**. "Phase 문서와의 순서가 어긋났다" 는 사실 관찰은 유효하나, "그래서 위험하다" 는 추론은 (a) 계획 문서의 구속력 (b) auth 가 실제 블로커인지 — 두 가지 모두에서 약하다.

### 9.3 섹션 8.4 (SWR 통일 범위) — **동의, 중요한 보강**

섹션 8.4 가 지적한 "useSWR 사용 ≠ SWR 전략 통일" 은 섹션 3 이 놓친 관점이다. 실제로 이번에 backlog 에 `BL-FE-66~68` (SWR global provider · dashboard cache · youtube cache) 가 별도로 존재한다면, **캐시 키 설계/revalidation 정책/mutate 기준의 통일**은 여전히 미완이다.

이 관점을 섹션 3 의 표에 반영하면:

| 요약 | 실제 상태 | 정정 판정 |
|---|---|---|
| FE SWR 통일 | hook 3개가 `useSWR` 사용, but 캐시 키/revalidation 정책은 feature 별로 상이. `BL-FE-66~68` 미소화 | **부분 완료** — hook 도입은 ✅, 전략 통일은 ❌ |

### 9.4 섹션 8.7 B (PG `create_all` 의 "높음" 긴급도) — **일부 과대**

섹션 8.7 B 는 `PgBase.metadata.create_all(bind=pg_engine)` 를 "배포마다 암묵적 스키마 변경, 롤백 불가" 로 **높음** 긴급도로 분류했다. 실제 코드는 이렇다:

```68:74:alpha-terminal-ai-server/main.py
try:
    PgBase.metadata.create_all(bind=pg_engine)
except Exception:
    logger.exception(
        "PostgreSQL schema init failed — JSONB article content store unavailable. "
        "Check PG_* env and that Postgres is reachable from the API container (not host localhost unless network_mode=host)."
    )
```

- `create_all` 은 SQLAlchemy 의미상 **존재하지 않는 테이블/컬럼만 추가**한다. 기존 테이블/컬럼을 `ALTER` 하지 않는다. 따라서 "배포마다 암묵적 스키마 변경" 은 **정확하지 않다** — 정확히는 "새 ORM 모델을 추가하면 첫 배포 시 테이블이 생성된다" 이다.
- 진짜 위험은 다음 두 가지:
  1. **환경 간 스키마 드리프트**: dev 는 `create_all` 로 생성된 스키마, prod 는 수동 스키마 — 디테일(인덱스, default, FK)이 달라지면 Alembic 이 잡지 못하는 drift 가 누적된다.
  2. **Alembic 베이스라인과의 충돌**: PG 에 Alembic 을 도입하려 할 때 `alembic stamp` 이전에 `create_all` 이 먼저 실행되면 "이미 존재하는 테이블" 을 마이그레이션이 다시 만들려고 하는 사고가 난다.
- 긴급도는 **"중간"** 이 정확하다. 현재 운영 중인 테이블이 `create_all` 이 추가하려는 테이블과 동일하다면 매 배포마다 무사고로 넘어간다. 진짜 위험은 "PG Alembic 도입 시점" 이지 "매 배포" 가 아니다.

### 9.5 놓친 이슈 — 양쪽 리뷰 모두 지적하지 않은 것

실제 코드를 다시 읽으며 발견한, 섹션 2~8 어디에서도 언급되지 않은 이슈들:

**A. `RunPipelineUseCase` 의 `_analyze_single_best` — Semaphore 위치 확인 필요**

```22:alpha-terminal-ai-server/app/domains/pipeline/application/usecase/run_pipeline_usecase.py
_SINGLE_BEST_CONCURRENCY = 4
```

이것이 모듈 레벨 상수로만 존재한다는 것은 확인했지만, **실제 Semaphore 인스턴스가 메서드 내부에서 매번 `asyncio.Semaphore(4)` 로 생성**되는지, 아니면 심볼 루프 바깥에서 공유되는지가 섹션 2.4 에서 "확인 필요" 로만 남아있다. 이는 **의미 있는 차이**:
- 메서드 내부 생성: 심볼당 4 동시 — 5심볼 파이프라인이면 최대 20 동시 OpenAI 호출 → rate limit 사고 가능
- 루프 바깥 공유: 전체 파이프라인에서 4 동시 — 의도에 부합

한 줄 확인으로 끝나는 일이니 다음 PR 에서 반드시 fix-or-confirm 해야 한다.

**B. `RedisProgressStore.append` 의 `rpush` — 이벤트 스트리밍 순서 보장 약함**

```27:35:alpha-terminal-ai-server/app/domains/pipeline/adapter/outbound/state/redis_progress_store.py
def append(self, account_id: Optional[int], message: str) -> None:
    key = self._key(account_id)
    try:
        pipe = self._redis.pipeline()
        pipe.rpush(key, message)
        pipe.expire(key, self._ttl)
        pipe.execute()
    except Exception as e:
        logger.warning("[RedisProgressStore] append 실패: %s", e)
```

- `rpush + expire` 를 pipeline 으로 묶은 것은 좋다. 단 **Redis pipeline 은 transaction 이 아니다** (MULTI/EXEC 가 아닌 단순 파이프라이닝). 두 명령 사이에 다른 클라이언트 명령이 끼어들 수 있다. 이 도메인에서는 expire 재설정이 약간 늦어도 기능적 문제는 없지만, "원자 실행" 이라는 섹션 2.3 의 평가는 **정확하지 않다**. transaction 이 필요하면 `pipe.transaction()` 또는 Lua 스크립트가 맞다.
- 더 중요한 것: **여러 프로세스가 동시에 `append` 하면 순서가 뒤섞인다**. 진행 이벤트의 순서가 사용자 UI 에 그대로 보인다면, 멀티 워커 상황에서 메시지 순서 역전이 발생할 수 있다. 지금 사용 패턴이 "한 세션 = 한 워커" 로 보장되는지 확인 필요.

**C. `factory.py` 의 폴백 실패 경로가 관찰 가능하지 않다**

```37:38:alpha-terminal-ai-server/app/domains/pipeline/adapter/outbound/state/factory.py
except Exception as e:
    logger.warning("[pipeline-state] Redis 연결 실패 → in-memory 폴백: %s", e)
```

Redis 가 살아있다고 믿고 `pipeline_state_redis_enabled=True` 로 배포했는데 **기동 시점에만 Redis 가 다운이면 영구적으로 in-memory 로 떨어진다**. 기동 로그를 감시하지 않으면 멀티 워커에서 세션 간 데이터가 안 맞는 증상이 나타날 때까지 모른다. 팩토리가 **주기적으로 Redis 로 재승격을 시도하거나**, 최소한 `/health` 엔드포인트에 현재 선택된 backend 를 노출해야 한다.

**D. Frontend `requestJson<T>` — 에러 응답 스키마 처리 미확정**

섹션 2.8 은 "런타임 검증 가치가 약하다" 까지만 지적했다. 추가로:
- `requestJson<T>` 가 4xx/5xx 응답에서 JSON body 를 어떻게 파싱하는지(성공 스키마 `T` 로 억지 파싱하려 하는지, `readApiError` 경로로 분기하는지)가 명확하지 않다. hot path 전환 전에 **에러 응답 스키마도 generic 으로 받아야** (예: `Result<T, E>`) 호출부가 try/catch + instanceof 지옥에서 벗어난다.

### 9.6 정정된 "다음 PR 우선순위"

섹션 6 (Opus 1차) + 섹션 8.5 (Sonnet) + 9.1~9.5 를 합쳐서 재정렬:

| # | 작업 | 의존성 | 긴급도 | 시간 | 상태 |
|---|---|---|---|---|---|
| 1 | Semaphore 위치 확인 + 상수 설정화 | 없음 | **높음** (잠재 rate limit 사고) | 30분 | ✅ 완료 (BL-BE-83) |
| 2 | pyright 실질 게이팅 (화이트리스트 strict) | 없음 | 높음 (관성 굳기 전) | 반나절 | ✅ 완료 (BL-BE-87) |
| 3 | 성능 수치화 3종 | 없음 | 높음 (이번 PR 가치 증명) | 반나절 | 미완료 |
| 4 | `SerpClient` lifespan close + `factory` 싱글턴 락 | 없음 | 중간 | 반나절 | ✅ 완료 (BL-BE-85, close 훅 추가) |
| 5 | `store/authAtom.ts` 제거 + `features/auth` 로 이동 | 없음 | **중간** (섹션 9.1 의 이유) | 반나절 | ✅ 완료 (BL-FE-78, 파일 삭제) |
| 6 | PG Alembic cutover 준비 (`create_all` 제거) | PG Alembic 리비전 선행 | 중간 | 1~2일 | ✅ 완료 (BL-BE-84, lifespan 이동) |
| 7 | `RunPipelineResponse` DTO + `response_model` | `RunPipelineResult` 있음 | 중간 | 2시간 | ✅ 완료 (BL-BE-86) |
| 8 | Redis 어댑터 계약 테스트 + append 순서 정책 문서화 | 없음 | 중간 | 반일 | 미완료 |
| 9 | `requestJson<T>` 에러 스키마 확정 후 hot path 전환 | 없음 | 낮음 | 1일 | 미완료 |
| 10 | SWR 전략 통일 (캐시 키 규약 · revalidation 정책 문서) | auth 정리(5) 이후 권장 | 낮음 | 1~2일 | 미완료 |

> **2026-04-21 업데이트**: #1·2·4·5·6·7 총 6건 구현 완료. 미완료 항목은 #3(성능 수치화), #8(Redis 계약 테스트), #9(requestJson 전환), #10(SWR 전략 통일) 4건.

### 9.7 이 문서의 품질에 대한 메타 리뷰

섹션 2~6 (Opus 1차): 기술 항목별로는 꼼꼼하지만 "왜 지금 이걸 했는가" 라는 전략 관점이 약했다.
섹션 8 (Sonnet): 전략 관점은 추가됐지만 **Audit/Phase1 계획 문서를 과도하게 구속력 있게 다뤘다**. "계획에 있었는데 안 했다" 는 관찰 → "그래서 순서가 잘못됐다" 는 가치 판단으로 바로 건너뛰었다.
**둘 다 아쉬운 것**: 실제 코드로 검증한 섹션이 섹션 8.7 부터였다는 점. 이 문서의 1차 작성 시점(섹션 2~7)에 `authAtom` 파일을 한 번만 열어봤어도 "이중 상태" 라는 표현을 안 썼을 것이다. **리뷰 문서일수록 "한 줄 읽으면 끝나는 확인" 을 게을리하지 말 것.**

### 9.8 한 줄 최종 결론

> 오늘 실행된 리팩토링은 **기술 품질 8/10, 스코프 적합성 9/10, 문서화 7/10**. 섹션 8 의 "Phase 순서 역전" 지적은 과도하고, "auth 는 버그가 아니라 부채" 라는 섹션 8.7 A 는 부분적으로만 맞다. 당장 막아야 할 진짜 구멍은 (1) `_SINGLE_BEST_CONCURRENCY` Semaphore 위치 확인, (2) pyright 실질 게이팅, (3) 성능 수치화 — 이 셋이고, 나머지는 모두 "부채 상환" 카테고리다.

---

## 10. 현장 발견 이슈 — market_videos stale 데이터 (BL-BE-89, 2026-04-21)

### 10.1 증상

프론트엔드 `features/youtube` 에서 SK하이닉스 검색 시 영상 4개만 노출되고, 모두 약 한 달 전(2026-03-27 ~ 03-28) 데이터.

### 10.2 DB 확인

```sql
SELECT COUNT(*), MIN(published_at), MAX(published_at) FROM market_videos WHERE ... SK하이닉스 ...;
-- total=6, oldest=2026-03-27 09:50:04, newest=2026-03-28 01:45:35
```

2026-04-21 기준 최신 데이터가 **24일 전**. API 응답은 필터링으로 4건.

### 10.3 원인 — 3가지가 겹친 구조적 문제

단순히 "스케줄러 누락" 이 아니다. 코드를 끝까지 따라가보면:

1. **수집 trigger 부재**: `CollectMarketVideoUseCase` 의 유일한 호출 경로가 `POST /youtube/collect` 수동 호출. 프론트가 자동으로 호출하지 않고, 어떤 스케줄러에도 등록되지 않음.
2. **수집 소스 협소**: `CHANNEL_IDS` 가 언론사 9개 채널 하드코딩. "SK하이닉스 분석" 같은 투자·분석 전문 유튜버 영상은 원천 차단.
3. **재수집 윈도우 제약**: `publishedAfter = now - 7d` 를 YouTube API 파라미터에 박음. 7일 넘는 공백이 생기면 해당 기간 영상은 영구히 수집 불가.

세 요인이 합쳐진 결과가 "핫한 종목인데 한 달 전 영상 4개" 다.

### 10.4 1차 시도 (롤백) — 스케줄러 도입

처음에는 `app/infrastructure/scheduler/market_video_scheduler.py` 를 신설해 전체 사용자 watchlist 종목을 union 하여 평일 08:30 / 14:00 KST 에 수집하는 방식을 도입했다(BL-BE-88).

다음 이유로 **롤백**:

1. 유령 계정의 watchlist 까지 무차별 수집 → YouTube Data API 쿼터 낭비.
2. `TOP_N=10` 상한 때문에 대상 종목이 많을수록 서로 자리를 뺏음.
3. "로그인한 사용자 내 관심종목" 이라는 서비스 의미론과 불일치.

### 10.5 최종 수정 — on-demand 수집 + 검색 소스 편입 (BL-BE-89)

"사용자가 youtube 탭에 진입하는 순간 내 관심종목 최신 영상이 자동으로 보인다" 는 계약을 백엔드에서 강제.

**변경 파일**:

- `app/domains/market_video/application/usecase/market_video_repository_port.py`: `find_latest_published_at(stock_name)` 추상 메서드 추가.
- `app/domains/market_video/adapter/outbound/persistence/market_video_repository_impl.py`: 해당 메서드 구현 (`title.contains(stock_name)` + `ORDER BY published_at DESC LIMIT 1`).
- `app/domains/market_video/application/usecase/get_youtube_video_list_usecase.py`: `page == 1 AND stock_name` 조건에서 stale 체크 후 `_refresh_if_stale()` 실행. 내부에서 (1) `CollectMarketVideoUseCase` 로 언론사 9채널 수집, (2) `YoutubeSearchAdapter.search()` 결과를 `MarketVideo` 로 변환해 `upsert_all()`. 두 경로 모두 실패 격리.
- `app/domains/market_video/adapter/inbound/api/youtube_router.py`: 유즈케이스에 `channel_video=YoutubeChannelVideoAdapter()` 추가 주입.
- `app/infrastructure/config/settings.py`: `market_video_stale_hours: int = 6` 추가.

**효과**:

- 로그인한 사용자가 youtube 탭 첫 페이지에 진입 → 자신이 본 종목이 stale 이면 즉시 수집이 선행되고 결과가 보인다.
- 수집 경로가 언론사 9채널 + YouTube 전체 검색(`{stock} 주식 분석`) 이중화 → 롱테일 보강.
- 스케줄러 없음 → YouTube API 쿼터가 실제 사용자 트래픽에 비례.
- 2번째 방문자부터 6시간 이내 재방문 시에는 DB 캐시 히트.

backlog: [BL-BE-89-youtube-on-demand-collect.md](../alpha-terminal-ai-server/docs/backlog/BL-BE-89-youtube-on-demand-collect.md)

### 10.6 리뷰 교훈

1. **증상 → 원인 추론을 코드 없이 건너뛰지 말 것**: "stale 이니 스케줄러가 없어서겠지" 는 1차 가설에 불과했다. 실제로는 수집 소스·수집 윈도우까지 세 층위 제약이 얽혀 있었다. 각 층위를 코드로 확인하지 않은 채 스케줄러부터 만든 것이 이번의 실수.
2. **"활성 사용자 union 수집" 같은 광범위 전략은 YouTube API 쿼터 상 항상 비싸다**: 사용자 트래픽 기반 on-demand 가 거의 모든 경우 더 경제적이며 의미론과도 맞는다.
3. **후속 제안**: `CollectMarketVideoUseCase` 의 `CHANNEL_IDS` / `DAYS_BACK` / `TOP_N` 을 `Settings` 로 외부화, on-demand trigger 를 `BackgroundTasks` 로 비동기화하여 첫 요청 응답 시간 개선, Prometheus 메트릭 `market_video_refresh_total{result}` 노출.

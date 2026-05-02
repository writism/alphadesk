# 2026-04-21 업스트림 PR 제출 보고서

> 2026-04-21 리팩토링·디버깅 결과를 BL 번호 단위로 분할하여 업스트림 `EDDI-RobotAcademy`에 제출한 PR 10건의 종합 보고서.

---

## 1. 개요

- **제출자 브랜치**: `writism:pr/upstream-*`
- **타겟**: `EDDI-RobotAcademy/alpha-terminal-*:main`
- **총 PR 수**: 10건 (BE 4건 + FE 6건)
- **전략**: 옵션 B — 리팩토링은 묶고, 디버깅 수정은 BL 단위로 분리, 신규 기능은 별도 PR
- **머지 권한**: 팀장 (본 보고서 작성자는 PR 생성까지만 수행)

---

## 2. Backend PRs (4건)

### BE #17 — `refactor(be): perf·types 리팩토링 + 관련 후속 백로그 일괄 반영`

링크: https://github.com/EDDI-RobotAcademy/alpha-terminal-ai-server/pull/17

| 항목 | 내용 |
|---|---|
| 브랜치 | `writism:pr/upstream-refactor-be` |
| 변경 규모 | 38 files (+1,523 / -167) |
| 포함 BL | BL-BE-77, 83, 84, 85, 86, 87 + BL-BE-78 문서 |

**핵심 변경**
- 이벤트 루프 블로킹 제거: OpenAI 어댑터 5종 `AsyncOpenAI` 전환, `/news/search` `run_in_threadpool` 오프로드, `SerpClient` `httpx.Client` 커넥션 풀링(BL-BE-85)
- 파이프라인 병렬화: `asyncio.gather` + 인스턴스 레벨 `Semaphore(4)` (BL-BE-83)
- 전역 상태 제거: `_progress_store` / `_summary_registry` → Port/Adapter + Redis/인메모리 팩토리
- DB 세션 일원화: `session_scope()` / `pg_session_scope()` `contextmanager` (`Iterator[Session]` 시그니처 수정)
- `PgBase.metadata.create_all()` lifespan startup 이동 (BL-BE-84)
- `RunPipelineResult` / `RunPipelineResponse` DTO + `POST /pipeline/run` `response_model` 선언 (BL-BE-86)
- Pyright CI 게이팅 실효화: `continue-on-error: true` 제거 + 레거시 룰 단계적 완화 전략 (BL-BE-87)
- 파이프라인 실행 로그: `article_mode`, 종목별 기사 건수 기록 (BL-BE-77)

**주의 사항**
- Pyright 룰 완화: 레거시 SQLAlchemy `Column[T]` / LangChain stub 미비로 `reportArgumentType`·`reportCallIssue` = `none`, 나머지 광범위 이슈는 `warning`. `reportInvalidTypeForm`·`reportReturnType`·`reportAssignmentType`은 `error` 유지.
- Alembic 마이그레이션 없음 (이 PR 범위).

---

### BE #18 — `feat(be): UserProfile 실DB + ORM 필드 + ContextBuilder 안전접근 (BL-BE-79/80/81)`

링크: https://github.com/EDDI-RobotAcademy/alpha-terminal-ai-server/pull/18

| 항목 | 내용 |
|---|---|
| 브랜치 | `writism:pr/upstream-bl-be-79-80-81` |
| 변경 규모 | 12 files |
| 포함 BL | BL-BE-79, 80, 81 |

**핵심 변경**
- BL-BE-79: `market_analysis_router` `MockUserProfileRepository` → `UserProfileRepositoryImpl(db)` 교체, `get_by_account_id()` 브릿지 추가
- BL-BE-80: `UserProfileORM`에 `investment_style` / `risk_tolerance` / `preferred_sectors` / `analysis_preference` / `keywords_of_interest` 5개 컬럼 추가, Mapper·Request·Response·Router·Alembic migration (`rkf23kknt8kl_add_user_profile_investment_fields`) 동반
- BL-BE-81: `ContextBuilderService.build()` 직접 속성 접근 → `getattr(obj, attr, default)` 안전접근 + 빈 필드 생략

**주의 사항**
- **Alembic migration 포함** — 운영 DB 적용 전 백업 필수.
- FE #18(feat-fe)과 한 쌍으로 동작. 본 PR 머지 후 FE 머지 권장.

---

### BE #19 — `fix(be): StockTheme JSON 파싱 try-except 보강 (BL-BE-82)`

링크: https://github.com/EDDI-RobotAcademy/alpha-terminal-ai-server/pull/19

| 항목 | 내용 |
|---|---|
| 브랜치 | `writism:pr/upstream-bl-be-82` |
| 변경 규모 | 2 files (+51 / -2) |
| 포함 BL | BL-BE-82 |

**핵심 변경**
- `market_data_repository_impl.get_stock_themes_by_codes()`의 `json.loads()`를 `try-except (JSONDecodeError, TypeError)`로 감싸 `[]` 폴백 + `logger.warning(종목코드)` 기록
- silent fail 방지

---

### BE #20 — `feat(be): market_videos on-demand 재수집 — stale 데이터 근본 해결 (BL-BE-89)`

링크: https://github.com/EDDI-RobotAcademy/alpha-terminal-ai-server/pull/20

| 항목 | 내용 |
|---|---|
| 브랜치 | `writism:pr/upstream-bl-be-89` |
| 변경 규모 | 6 files (+252 / -4) |
| 포함 BL | BL-BE-89 |

**근본 원인 (3중 결함)**
1. 자동 수집 트리거 없음 (수동 POST만 존재)
2. 수집 소스 협소 (뉴스채널 9개 하드코딩)
3. 수집 창 7일 제한

**해결 방식**
- `GET /youtube/list` `page=1 & stock_name` 조회 시 staleness 검사 → on-demand refresh
- `MarketVideoRepositoryPort.find_latest_published_at(stock_name)` 추가
- `GetYoutubeVideoListUseCase._refresh_if_stale()`: 채널 기반(`CollectMarketVideoUseCase`) + 광역 검색(`YoutubeSearchAdapter.search()`) 병행
- `settings.market_video_stale_hours` = 6h (기본)
- 실패는 로그만, 사용자 조회 블로킹 X

---

## 3. Frontend PRs (6건)

### FE #17 — `refactor(fe): perf·types 리팩토링 + 관련 문서`

링크: https://github.com/EDDI-RobotAcademy/alpha-terminal-frontend/pull/17

| 항목 | 내용 |
|---|---|
| 브랜치 | `writism:pr/upstream-refactor-fe` |
| 변경 규모 | 13 files |
| 포함 BL | (리팩토링 본체) + BL-FE-66/67/68 문서만 |

**핵심 변경**
- `requestJson<T>` 제네릭 헬퍼
- `board/read/[id]/page.tsx` non-null assertion(!) 제거 + 명시 null 체크
- `next/dynamic`으로 `StockSummaryCard` / `ShareActionBar` 지연 로딩
- `NewsItem` `React.memo`
- 브리핑 기본값 조정 (KR 07:00 / US 21:00 KST)

**문서**: `2026-04-21-perf-and-type-refactor.md`, `app-architecture-improvement-proposal.md`, `navigation-menu-analysis.md`, BL-FE-66/67/68 (SWR 도입 백로그)

---

### FE #18 — `feat(fe): My 투자 프로필 섹션 + alpha-desk 페이지`

링크: https://github.com/EDDI-RobotAcademy/alpha-terminal-frontend/pull/18

| 항목 | 내용 |
|---|---|
| 브랜치 | `writism:pr/upstream-feat-fe` |
| 변경 규모 | 7 files |

**핵심 변경**
- `MyInvestmentProfileSection.tsx` + `useInvestmentProfile.ts` + `myApi.ts` (InvestmentProfile API)
- `app/my/page.tsx` 섹션 삽입
- `app/alpha-desk/page.tsx` (신규 페이지)
- `savedArticleContentAtom.ts`, `MobileSegmentTabs.tsx` (신규 UI 유틸)

**종속성**: BE #18 선머지 필요 (`/users/{id}/investment-profile` 엔드포인트).

---

### FE #19 — `fix(fe): articleMode localStorage 영속화 (BL-FE-75)`

링크: https://github.com/EDDI-RobotAcademy/alpha-terminal-frontend/pull/19

`myApi.ts`에 `getArticleModeLocal` / `saveArticleModeLocal` 추가, `useMySettings`에서 로드/저장 동기화.

---

### FE #20 — `fix(fe): useDashboard Promise.all → allSettled (BL-FE-76)`

링크: https://github.com/EDDI-RobotAcademy/alpha-terminal-frontend/pull/20

대시보드 3개 API 중 부분 실패 허용. 401은 즉시 throw, 전체 실패만 에러 처리, 부분 실패는 성공 섹션 렌더.

---

### FE #21 — `fix(fe): useNewsList useEffect 의존성 배열 수정 (BL-FE-77)`

링크: https://github.com/EDDI-RobotAcademy/alpha-terminal-frontend/pull/21

필터 객체 필드 누락으로 URL 변경 시 재페칭 안 되던 버그. stale closure 제거.

---

### FE #22 — `chore(fe): store/authAtom 삭제 (BL-FE-78)`

링크: https://github.com/EDDI-RobotAcademy/alpha-terminal-frontend/pull/22

인증 atom 이중 구조 정리. 참조 0건 확인 후 삭제. 기능은 `authSelectors.isLoggedInAtom`이 대체.

---

## 4. 초기 계획과 달라진 점

| 당초 계획 | 최종 | 사유 |
|---|---|---|
| BL-BE-85 단독 PR | **BE #17에 흡수** | `serp_client.py`의 httpx 풀링(리팩토링)과 `close()`가 한 블록이라 분리 불가 |
| BL-BE-81 단독 PR | **BE #18에 통합** | `context_builder_service.py`에서 BL-BE-79의 "빈 필드 생략"과 BL-BE-81의 `getattr`이 한 블록에 섞임 |
| BE PR 6건 | **4건으로 축소** | 위 두 건 흡수·통합 |

---

## 5. 팀장 권장 머지 순서

### Backend
1. **BE #17** (refactor) — 기반 리팩토링, 나머지 PR들의 베이스
2. **BE #19** (StockTheme JSON) — 독립, 충돌 없음
3. **BE #20** (market_videos) — 독립, 충돌 없음
4. **BE #18** (UserProfile) — **Alembic migration 포함, DB 백업 후 적용**

### Frontend
1. **FE #17** (refactor) — 기반
2. **FE #19 / #20 / #21 / #22** (개별 버그픽스) — 순서 무관
3. **FE #18** (feat) — BE #18 의존, BE #18 머지 후 진행

---

## 6. 잠재 Conflict 주의

### `features/my/infrastructure/api/myApi.ts`
- **FE #18 (feat-fe)**: `InvestmentProfile` 인터페이스 + `getInvestmentProfile` / `saveInvestmentProfile` 추가
- **FE #19 (bl-fe-75)**: `ArticleMode` import + `getArticleModeLocal` / `saveArticleModeLocal` 추가

두 PR이 같은 파일의 다른 위치에 추가. 먼저 머지되는 쪽 이후 나머지에서 작은 rebase 필요 (import 줄 + export 블록 병합, 로직 충돌은 없음).

---

## 7. 이후 작업 (별도 백로그)

### Backend
- 레거시 Pyright 승격 (Column[T] 타입 정리, 외부 stub 보강)
- Alembic 전면 전환 (create_all + _run_column_migrations 제거)
- 채널 기반 수집 소스 확장 (BL-BE-89 후속)

### Frontend
- SWR 전면 도입 (BL-FE-66/67/68)
- 인증 상태 단일화 — `features/auth` vs 나머지 atom
- `requestJson<T>` hot path 일괄 마이그레이션

---

## 8. 본 보고서 작성 근거

- 기준 시점: 2026-04-21
- 업스트림 비교: `upstream/main`
- 커밋 · 푸시 완료 지점: `origin/main` (writism) + 각 `pr/upstream-*` 브랜치
- 안전 백업 태그: `backup/pre-split-20260421` (양 리포지토리 모두)

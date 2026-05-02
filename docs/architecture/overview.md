# Alpha Terminal 전체 리팩토링 진단 보고서

> 작성일: 2026-04-18
> 범위: `alpha-terminal-frontend`, `alpha-terminal-ai-server`, 루트 운영 문서/배포 구조
> 작성 기준: 코드 구조 조사 + 기존 문서 대조 + 설정 파일 검토

---

## 1. 요약

현재 코드베이스는 "완전히 무질서한 상태"는 아니다. 오히려 백엔드는 Hexagonal Architecture + DDD를 강하게 지향하고 있고, 프론트는 feature-based layered structure로 정리하려는 의도가 분명하다. 다만 실제 구현은 그 의도를 100% 일관되게 따르지 못하고 있으며, 다음 네 가지가 리팩토링의 핵심 축으로 보인다.

1. 프론트 인증/상태관리의 이중 구조
2. 프론트 데이터 패칭 전략의 혼재
3. 백엔드 `main.py` 조립부와 수동 마이그레이션 누적
4. 문서/배포/환경 구조의 "여러 진실 소스" 문제

결론적으로:

- **백엔드 구조 적합도**는 비교적 높다.
  - 장점: 도메인별 폴더링, 포트/어댑터 지향, DTO/ORM 분리 의도 명확
  - 문제: composition root, 마이그레이션, 스케줄러, 인메모리 상태 관리가 아키텍처 일관성을 약화시킴

- **프론트 구조 적합도**는 중간 수준이다.
  - 장점: feature 단위로 domain/application/infrastructure/ui를 분리하려는 방향이 좋음
  - 문제: auth/state/data fetching 규칙이 한 번 더 통일되어야 함

- **리팩토링의 기대 효과는 분명하지만, 전부가 속도 개선으로 환산되지는 않는다.**
  - 일부는 응답속도/API 호출 수 개선
  - 더 큰 일부는 장애 예방, 배포 안정성, 변경 비용 절감 효과

---

## 2. 현재 기술 스택 정리

### 프론트엔드

- Framework: `Next.js 16`
- UI: `React 19`, Tailwind CSS v4
- 상태관리: `Jotai`
- 데이터 패칭/캐시: `SWR`
- 언어/도구: `TypeScript`, `ESLint`, `Storybook`

확인 포인트:

- `alpha-terminal-frontend/package.json` 기준 실제 핵심 의존성은 비교적 단순하다.
- `next.config.ts`에서 `output: "standalone"`과 `experimental.workerThreads = false`, `cpus = 1`이 설정되어 있어 빌드/배포 안정화를 위한 운영성 튜닝 흔적이 있다.
- 프론트 하위에 `alpha-terminal-frontend/alpha-desk-frontend/package.json`이 하나 더 존재하여, "정식 앱 트리"와 "남아 있는 보조 스캐폴드"가 혼재할 가능성이 있다.

### 백엔드

- Framework: `FastAPI`, `Uvicorn`
- ORM/DB: `SQLAlchemy 2.x`, MySQL(PyMySQL), PostgreSQL(psycopg2)
- 캐시/인프라: `Redis`, `APScheduler`
- AI/외부 연동: `OpenAI`, `LangChain`, `LangGraph`, `httpx`, `tweepy`, `trafilatura`, `kiwipiepy`
- 마이그레이션 도구: `Alembic`
- 테스트: `pytest`

확인 포인트:

- Python 서비스로는 비교적 무거운 기술 스택이다.
- 데이터 저장소가 MySQL + Redis + PostgreSQL(pgvector 포함 가능성)로 분기되어 있어 구조 통제가 중요하다.
- 현재는 "도메인 구조는 진보적이지만 운영 레이어는 과도기"에 가깝다.

---

## 3. 아키텍처 적합도 평가

### 3-1. 백엔드: Hexagonal Architecture / DDD 적합도

백엔드의 의도된 규칙은 `alpha-terminal-ai-server/CLAUDE.md`에 매우 명확하게 선언되어 있다.

- `adapter -> application -> domain` 방향 의존성
- Domain은 순수 Python 유지
- ORM / External API / Redis / FastAPI는 Domain에 직접 노출 금지
- Router에는 비즈니스 로직 금지

즉, "설계 원칙"은 상당히 좋다.

실제 구현도 상당 부분 이 원칙을 따른다.

- `app/domains/<domain>/adapter/inbound/api`
- `app/domains/<domain>/application`
- `app/domains/<domain>/domain`
- `app/domains/<domain>/infrastructure`

이런 폴더 패턴은 헥사고날/DDD 지향 구조로 충분히 해석 가능하다.

다만 실제 코드는 아래 지점에서 규칙이 흔들린다.

- `main.py`가 너무 많은 책임을 가진다.
- `Base.metadata.create_all()`와 수동 SQL 마이그레이션이 함께 존재한다.
- 일부 라우터가 orchestration과 운영성 로직을 직접 품는다.
- 인메모리 전역 상태가 남아 있어 멀티 인스턴스/멀티 워커 안정성이 약하다.
- 포트와 구현체 위치 규칙이 도메인마다 조금씩 다르다.

평가:

- **구조 방향성**: 높음
- **구현 일관성**: 중간 이상
- **운영/배포 적합성**: 중간

### 3-2. 프론트: Feature-based layered structure 적합도

프론트는 백엔드처럼 헥사고날이라고 보기는 어렵지만, 아래와 같은 구조 의도가 있다.

- `features/<name>/domain`
- `features/<name>/application`
- `features/<name>/infrastructure`
- `features/<name>/ui`

이 구조는 프론트에서 흔히 쓰는 feature-sliced / layered pattern에 가깝다.

좋은 점:

- 기능 단위로 모델, 훅, API, UI를 묶으려는 의도가 분명하다.
- 공통 HTTP 계층과 SWR 설정이 존재한다.
- 신규 기능일수록 feature 경계가 상대적으로 잘 잡혀 있다.

문제점:

- 인증 상태가 이중 구조다.
- 일부 페이지는 여전히 `app/` 아래에 비대한 client component 형태로 남아 있다.
- 같은 리소스도 훅마다 `SWR`, `useEffect`, Jotai imperative fetch를 제각각 사용한다.
- 레거시 API 모듈과 feature API 모듈이 공존한다.

평가:

- **구조 방향성**: 중간 이상
- **구현 일관성**: 중간
- **확장성/변경 용이성**: 중간

---

## 4. 핵심 진단 결과

## 4-1. 프론트엔드 상세 진단

### A. 인증 상태가 두 갈래로 나뉘어 있다

확인 파일:

- `alpha-terminal-frontend/store/authAtom.ts`
- `alpha-terminal-frontend/features/auth/application/atoms/authAtom.ts`
- `alpha-terminal-frontend/features/auth/application/hooks/useAuth.ts`
- `alpha-terminal-frontend/components/AuthProvider.tsx`

현재 인증 상태는 최소 두 층으로 관리된다.

- 단순 문자열 상태: `AUTHENTICATED | UNAUTHENTICATED`
- 사용자 객체까지 담는 상세 상태: `status + user`

문제는 이 둘이 항상 같이 갱신되지 않는다는 점이다.

- `AuthProvider`는 두 atom을 동시에 초기화한다.
- 그러나 `useAuth.logout()`은 상세 상태만 `UNAUTHENTICATED`로 바꾸고, `store/authAtom`은 직접 갱신하지 않는다.

영향:

- 로그아웃 후 특정 화면에서 "로그인된 상태" UI가 남는 문제 가능
- 화면마다 인증 상태의 기준이 달라져 디버깅 비용 증가
- 라우팅/권한 처리 기준이 분산됨

판단:

- 이 문제는 구조적 버그이자 리팩토링 1순위다.

### B. 인증 세션 로딩 경로도 이중화되어 있다

현재 인증 세션 복구 방식이 하나가 아니다.

- `AuthProvider`는 `fetchMe()`를 호출
- `useAuth.loadUser()`는 `detectAuthState()`를 호출

즉, "세션의 진실 소스"가 한 군데가 아니다.

영향:

- 페이지 최초 진입 시점과 TopBar/개별 화면의 해석이 다를 수 있음
- 인증 관련 버그가 발생할 때 재현 조건이 복잡해짐

### C. 데이터 패칭 전략이 통일되어 있지 않다

확인 파일:

- `alpha-terminal-frontend/infrastructure/swr/swrConfig.ts`
- `alpha-terminal-frontend/features/watchlist/application/hooks/useWatchlist.ts`
- `alpha-terminal-frontend/features/news/application/hooks/useNewsList.ts`

프로젝트에는 이미 SWR 전역 설정이 있다.

하지만 실제 사용은 통일되어 있지 않다.

- 일부는 `useSWR`
- 일부는 `useEffect + useState`
- 일부는 Jotai atom + imperative fetch

대표적으로:

- `useWatchlist`는 mount 시 매번 직접 fetch
- `useNewsList`는 내부에서 다시 `fetchWatchlist()`를 호출해 키워드를 조합한 뒤 뉴스 API를 호출

이 구조는 다음 문제를 만든다.

- 같은 세션에서 `/watchlist` 중복 호출
- 캐시 무효화 규칙이 리소스별로 다름
- 화면별 로딩/에러 처리 패턴이 달라짐

### D. `app/`와 `features/` 경계가 아직 완전히 정리되지 않았다

Subagent 조사 기준으로, `app/page.tsx`, 일부 dashboard 영역, 공통 shell이 아직 라우트 영역과 프레젠테이션/상태 로직을 동시에 들고 있다.

영향:

- App Router의 장점(RSC, 라우트 경계, loading/error boundary)을 충분히 못 살림
- 페이지 단위 책임과 기능 단위 책임이 섞임

### E. 장애 복원 구조가 약하다

현재 프론트에는 segment 단위 `error.tsx`, `global-error.tsx`가 확인되지 않았다.

영향:

- 특정 훅/페이지 오류가 사용자에게 일관된 복구 UX로 제공되지 않음
- 장애가 "조용히 빈 화면/부분 렌더 실패"로 보일 가능성

### F. 중복/레거시 파일 가능성이 있다

- 루트 `package.json` 외에 하위 `alpha-desk-frontend/package.json` 존재
- 일부 root-level `infrastructure/api/*`와 feature API 모듈이 함께 존재

이건 즉시 성능 저하를 만들기보다는, "잘못된 import"와 "새 개발자 혼란"을 만든다.

---

## 4-2. 백엔드 상세 진단

### A. `main.py`가 composition root 이상을 담당한다

확인 파일:

- `alpha-terminal-ai-server/main.py`

현재 `main.py`는 아래를 한 번에 수행한다.

- 모든 ORM import
- 모든 router 연결
- `create_all()`
- 수동 컬럼 마이그레이션
- PostgreSQL health check
- 3개 스케줄러 시작/종료

이건 부트스트랩 파일로서 너무 많은 책임이다.

영향:

- 테스트 어려움
- 스키마 변경/배포 리스크 증가
- 앱 시작 실패 시 원인 분리 어려움

### B. 마이그레이션 전략이 일관되지 않다

확인 파일:

- `alpha-terminal-ai-server/main.py`
- `alpha-terminal-ai-server/alembic/env.py`

현재 상태:

- MySQL: `Base.metadata.create_all()` + `_run_column_migrations()` 수동 SQL
- PostgreSQL: Alembic 대상 메타데이터가 `PgBase.metadata`

즉, DB 운영 방식이 하나가 아니다.

이 구조의 위험:

- 환경마다 스키마 상태가 달라질 수 있음
- 새 컬럼 추가/삭제가 코드 시작 시점에 암묵적으로 일어남
- 롤백/이력 추적이 어려움

이 항목은 구조적 안정성 측면에서 백엔드 최우선 리팩토링 대상이다.

### C. 일부 라우터가 orchestration 책임을 가진다

조사 결과 `pipeline_router`는 단순 API 입구를 넘어서 스케줄러 실행 지점, 전역 상태, 파이프라인 orchestration 일부를 같이 품고 있다.

이는 `CLAUDE.md`의 "Router에는 비즈니스 로직을 작성하지 않는다" 원칙과 긴장된다.

영향:

- HTTP 요청 흐름과 배치 작업 흐름이 같은 함수 경로를 공유
- 테스트와 장애 추적이 어려워짐
- 애플리케이션 서비스 계층의 응집도가 떨어짐

### D. 인메모리 전역 상태가 운영 안정성을 제한한다

pipeline 영역에는 메모리 기반 registry/progress store가 남아 있는 것으로 보인다.

이 구조는 다음 상황에서 취약하다.

- 멀티 프로세스
- 멀티 인스턴스
- 재시작 이후 상태 유실
- SSE/백그라운드 작업 중 워커 재배치

싱글 인스턴스 데모 환경에서는 버틸 수 있지만, 운영 안정성 측면에서는 약점이다.

### E. 스케줄러가 분산되어 있다

현재 lifespan에서 세 개의 scheduler 시작 함수가 호출된다.

- pipeline scheduler
- profile update scheduler
- proactive recommendation scheduler

기능상 큰 문제는 아닐 수 있지만, 운영 측면에서는 다음이 불편하다.

- 관측 포인트 분산
- shutdown/예외 처리 복잡도 증가
- 시간대가 겹칠 때 리소스 사용량 예측 어려움

### F. 비동기 라우트 + 동기 DB 조합은 관리 규칙이 필요하다

FastAPI 라우터는 `async def` 중심이지만, DB 세션은 sync SQLAlchemy 기반이다.
핫패스에서 `to_thread`, `executor` 처리가 일부 적용되어 있으나 전역 규칙으로 보이진 않는다.

영향:

- 잘못된 경로 하나만 있어도 event loop 블로킹 위험
- 성능 이슈가 "간헐적 지연" 형태로 나타날 수 있음

즉시 async ORM 전환이 정답은 아니지만, 최소한 "어떤 경로는 sync 허용 / 어떤 경로는 offload 필수" 기준은 문서화해야 한다.

### G. 테스트 표면이 구조 규모에 비해 좁다

테스트 디렉터리 확인 결과, 핵심 도메인 수에 비해 자동 테스트는 적은 편이다.

특히 보강이 필요한 영역:

- 인증
- pipeline
- scheduler
- watchlist/profile
- investment cache

이건 런타임 성능보다 "리팩토링 안전성"에 직접적인 영향을 준다.

---

## 4-3. 루트/운영 문맥 진단

### A. 문서와 실제 저장소 이름이 다소 어긋난다

루트 문서 일부는 `alpha-desk-*` 이름을 사용하고, 실제 현재 작업 디렉터리/원격 저장소는 `alpha-terminal-*` 기준으로 운영된다.

영향:

- 신규 인원 온보딩 혼선
- 배포 문서/운영 문서 참조 혼동

### B. 배포 "정답 문서"가 하나가 아니다

현재 조사된 배포 서사는 여러 개다.

- Vercel + Railway
- GitHub Actions + GHCR + EC2 self-hosted runner
- Oracle Cloud/systemd 방식 문서
- 로컬 docker-compose + nginx

이 자체가 잘못은 아니지만, "현재 주력 운영 경로"가 하나로 선언되어 있지 않으면 리팩토링 시 환경변수/네트워크/OAuth/CORS 결정이 흔들린다.

### C. 루트 워크스페이스는 모노레포처럼 보이지만 실제로는 별도 Git 저장소 2개다

즉, 리팩토링도 "한 PR"보다 "프론트/백엔드 별도 작업 + 공통 문서 동기화" 전략이 더 자연스럽다.

---

## 5. 리팩토링 우선순위 제안

## P0. 반드시 먼저 정리할 것

### 1. 프론트 인증 상태 단일화

목표:

- `authAtom` / `authStateAtom` 통합 또는 명확한 파생 구조화
- 세션 초기화 경로 하나로 통일
- logout/login/callback/update가 동일한 상태머신을 사용하도록 정리

이유:

- 기능 버그 가능성이 가장 높고
- 사용자 체감이 즉시 크며
- 후속 리팩토링의 기준점이 된다

### 2. 백엔드 마이그레이션 전략 단일화

목표:

- `create_all()` 의존 제거
- `_run_column_migrations()` 제거 또는 임시 호환 레이어로 축소
- MySQL 기준 버전드 마이그레이션 체계 확립

이유:

- 앱 속도보다도 운영 안정성/배포 재현성에 훨씬 중요
- 지금 손보지 않으면 이후 모든 도메인 작업이 부채 위에 쌓임

### 3. 현재 "공식 배포 경로" 확정

목표:

- 주 운영 환경을 하나로 선언
- 해당 환경 기준 env, OAuth redirect, CORS, 네트워크 규칙 문서화

이유:

- 구조 리팩토링은 항상 운영 경로와 맞물리기 때문

## P1. 구조 정리 효과가 큰 것

### 4. 프론트 데이터 패칭 규칙 통일

권장 방향:

- 읽기 데이터는 SWR 중심
- mutation 후 `mutate`로 무효화
- Jotai는 "UI 상태 / 선택 상태 / 전역 세션 상태" 중심으로 축소

우선 대상:

- watchlist
- news
- youtube
- dashboard

### 5. 백엔드 pipeline orchestration 분리

권장 방향:

- Router는 DTO 입출력과 HTTP 에러 매핑만 수행
- 파이프라인 실행/진행률/작업 상태 관리는 application service로 이동
- 스케줄러는 application service를 호출

### 6. 스케줄러와 장기 작업 구조 정리

권장 방향:

- scheduler 시작점을 한 곳으로 통합
- 각 job 등록만 분리
- 장기 SSE/백그라운드 작업의 상태 저장 위치를 Redis 등으로 승격 검토

### 7. 프론트 `app/`와 `features/` 경계 재정리

권장 방향:

- `app/`는 routing, layout, metadata, route shell 중심
- 비즈니스 UI와 훅은 `features/` 또는 `ui/`로 이동

## P2. 중기 개선

### 8. 공통 오류 처리/복구 UX 추가

- 프론트 `error.tsx`, segment boundary
- 백엔드 외부 API 예외 정책 통일
- 장애 로깅 정책 정리

### 9. 테스트 골격 확대

- 프론트: auth, watchlist, 주요 hook
- 백엔드: use case, repository, scheduler smoke, pipeline flow

### 10. 루트 문서와 명칭 통합

- `alpha-desk` vs `alpha-terminal` naming 정리
- 루트 실행/운영/onboarding 문서 통합

---

## 6. 예상 효과

아래 수치는 **코드 조사 기반 가설치**이며, 실제 수치는 리팩토링 전후 계측으로 검증해야 한다.

## 6-1. 속도

### 프론트 API 호출 감소

전제:

- watchlist/news/dashboard/youtube를 SWR 기준으로 통일
- 같은 세션 내 재방문/탭 전환 시 캐시 재사용

예상:

- 반복 탐색 시 API 호출 수 **약 30~60% 감소 가능**
- 뉴스/워치리스트 중복 호출은 특정 플로우에서 **1~2회 이상 절감**

신뢰도:

- **중간**
- 이미 프로젝트 문서(`docs/app-architecture-improvement-proposal.md`)에서도 유사 개선 가정이 제시되어 있고, 코드 구조상 중복 호출 가능성이 확인된다.

### 반복 분석 응답시간 개선

전제:

- 백엔드 분석 캐시/결과 재사용이 구조적으로 정리될 경우

예상:

- 캐시 히트 요청은 기존 수십 초급 작업이 **1초 내외**까지 단축될 수 있음
- 다만 이는 "캐시가 맞는 요청"에 한정되며, 모든 요청 평균이 그렇게 빨라지는 것은 아님

신뢰도:

- **중간**

### 서버 자원 사용 안정화

전제:

- scheduler 통합
- 장기 작업 상태 저장 개선
- event loop blocking 경로 정리

예상:

- 피크 시간 지연과 불규칙한 timeout 빈도가 완만해질 가능성
- 정량 수치는 현 시점 코드만으로 산정 불가

신뢰도:

- **낮음~중간**

## 6-2. 안정성

### 인증 관련 UI/상태 불일치 감소

예상:

- 로그인/로그아웃/콜백 직후 상태 불일치 버그 **상당폭 감소**
- 사용자 체감 안정성은 프론트 성능 개선보다 오히려 더 클 수 있음

신뢰도:

- **높음**

### 배포/스키마 변경 실패 위험 감소

전제:

- `create_all()` + 수동 SQL 누적 구조를 버전드 마이그레이션으로 전환할 경우

예상:

- 운영 배포 중 스키마 불일치/환경별 편차/재현 불가 이슈 **의미 있게 감소**

신뢰도:

- **높음**

### 리팩토링 안전성 증가

전제:

- 테스트 표면 확대
- 책임 경계 명확화

예상:

- 신규 기능 추가 시 회귀 버그 확률 하락
- 변경 영향 범위 파악 시간이 줄어듦

신뢰도:

- **높음**

---

## 7. 권장 리팩토링 로드맵

### Phase 1. 정합성 복구

기간 제안: 3~5일

- 프론트 auth 상태 통합
- 프론트 세션 초기화 경로 통합
- 공식 배포 경로 확정
- 루트/환경 문서 최소 정리

산출물:

- 로그인/로그아웃/세션 복구가 한 흐름으로 설명 가능
- 운영 기준 문서 1개

### Phase 2. 데이터/조립부 정리

기간 제안: 5~8일

- 프론트 watchlist/news/dashboard/youtube SWR 정리
- 백엔드 pipeline orchestration 추출
- scheduler 단일 entrypoint 정리

산출물:

- 읽기 데이터 패칭 규칙 1개
- 장기 작업 구조 1개

### Phase 3. 운영 기반 고도화

기간 제안: 1~2주

- 마이그레이션 체계 전환
- 테스트 골격 확대
- 프론트 오류 경계 및 shell 정리
- 문서/명칭 정합성 통합

산출물:

- 배포 가능한 구조의 안정화
- 후속 기능 개발 속도 향상

---

## 8. 이번 리팩토링에서 특히 주의할 점

1. 프론트 auth 리팩토링은 화면 동작 변경을 만들 수 있으므로 기능 테스트가 필수다.
2. 백엔드 마이그레이션 전환은 반드시 현재 운영 DB 기준 백업과 롤백 절차가 있어야 한다.
3. 배포 문서가 여러 갈래이므로, 어떤 환경을 기준으로 검증할지 먼저 고정해야 한다.
4. 루트 워크스페이스는 단일 Git 저장소가 아니므로, 프론트/백엔드/문서 변경을 별도 커밋 전략으로 가져가는 편이 안전하다.

---

## 9. 최종 판단

이 프로젝트는 "처음부터 다시 짜야 하는 수준"은 아니다.

오히려:

- 백엔드는 좋은 아키텍처 원칙 위에 운영 부채가 얹힌 상태
- 프론트는 좋은 기능 분리 방향 위에 상태관리/데이터계층 혼재가 남은 상태

즉, 이번 리팩토링은 전면 재작성보다 다음 원칙으로 가는 것이 맞다.

- **재작성보다 구조 정렬**
- **기능 추가보다 정합성 회복**
- **추상화 추가보다 진실 소스 통합**
- **성능 튜닝보다 운영 안정성 확보**

가장 효과가 큰 첫 단계는 아래 두 가지다.

1. 프론트 인증/세션 상태를 하나로 통합
2. 백엔드 DB 마이그레이션 체계를 하나로 통합

이 두 축이 정리되면, 이후 캐시, SSE, pipeline, 메뉴 구조, UX 정리는 훨씬 안전하고 빠르게 진행할 수 있다.

---

## 10. 후속 계측 권장 지표

리팩토링 효과를 실제로 검증하려면 다음 지표를 전후 비교하는 것이 좋다.

### 프론트

- 화면 전환 1세션당 API 호출 수
- watchlist/news/dashboard 재방문 시 네트워크 재요청 횟수
- 로그인/로그아웃 직후 UI 오류 재현 건수
- hydration/error boundary 발생 로그

### 백엔드

- 배포 시 스키마 적용 실패 건수
- pipeline/run-stream 평균 응답시간과 timeout 비율
- scheduler job 실패율
- 동일 분석 요청의 캐시 히트율
- 외부 API 실패 후 재시도/복구 성공률

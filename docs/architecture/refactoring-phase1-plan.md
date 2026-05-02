# Alpha Terminal 리팩토링 Phase 1 실행 계획

> 작성일: 2026-04-18
> 기준 문서: `docs/REFACTORING-AUDIT-20260418.md`
> 목표: 전면 재작성 없이 정합성 문제와 운영 부채를 먼저 줄이는 1차 리팩토링 실행안

---

## 1. Phase 1 목표

Phase 1의 목적은 기능 추가가 아니라, 이후 리팩토링과 기능 개발의 기준점을 만드는 것이다.

이번 단계에서 해결할 핵심 주제는 세 가지다.

1. 프론트 인증/세션 상태를 하나의 진실 소스로 통합
2. 현재 운영/배포의 공식 기준 경로를 하나로 고정
3. 백엔드 DB 마이그레이션을 "수동 누적"에서 "버전 관리" 중심으로 전환할 준비를 완료

즉, 이번 단계는 "속도 최적화"보다 **정합성 회복 + 운영 안정성 확보**가 우선이다.

---

## 2. 범위

## 포함

- 프론트 auth 상태 구조 정리
- 프론트 세션 bootstrap 경로 정리
- 프론트 auth consumer 정리
- 배포/운영 문서 기준선 정리
- 백엔드 migration 현황 inventory
- MySQL 기준 versioned migration 체계 전환 설계와 baseline 준비

## 제외

- 프론트 메뉴 구조 개편
- 프론트 전체 SWR 전환
- 백엔드 전체 async ORM 전환
- pipeline/SSE 대규모 구조 재작성
- 투자 분석 캐시 전면 도입

즉, 이번 단계는 "가장 위험한 뼈대"만 먼저 바로잡는다.

---

## 3. 작업 스트림

## Track A. 프론트 인증/세션 통합

### A-1. 목표 상태

프론트의 인증 상태는 아래 원칙으로 정리한다.

- 인증 상태는 **단일 atom 또는 단일 상태머신**이 기준이 된다.
- `AUTHENTICATED`, `UNAUTHENTICATED`, `LOADING`, `PENDING_TERMS` 등 상태 전이는 한 경로에서만 정의한다.
- 세션 초기화는 앱 시작 시 **하나의 bootstrap 함수**만 사용한다.
- 화면/컴포넌트는 공통 selector를 통해 auth 여부를 읽는다.

### A-2. 현재 문제

현재 문제의 핵심은 다음과 같다.

- `store/authAtom.ts`와 `features/auth/application/atoms/authAtom.ts`가 동시에 존재
- `AuthProvider`와 `useAuth.loadUser()`가 다른 세션 판단 방식을 사용
- logout 시 두 상태가 동시에 정리되지 않음

### A-3. 대상 파일

핵심 수정 후보:

- `alpha-terminal-frontend/store/authAtom.ts`
- `alpha-terminal-frontend/features/auth/application/atoms/authAtom.ts`
- `alpha-terminal-frontend/features/auth/application/hooks/useAuth.ts`
- `alpha-terminal-frontend/components/AuthProvider.tsx`
- `alpha-terminal-frontend/features/auth/infrastructure/api/authApi.ts`
- `alpha-terminal-frontend/infrastructure/api/authApi.ts`

소비자 점검 후보:

- `alpha-terminal-frontend/ui/layout/TopBar.tsx`
- `alpha-terminal-frontend/app/board/page.tsx`
- `alpha-terminal-frontend/app/board/create/page.tsx`
- `alpha-terminal-frontend/features/invest/ui/components/InvestPage.tsx`
- 기타 `authAtom`, `authStateAtom`, `isLoggedInAtom` 사용 파일

### A-4. 구현 순서

1. 현재 auth 상태 소비자 전체 검색
2. 공통 상태 모델 확정
3. bootstrap 함수 1개로 통합
4. logout/login/callback 전이를 공통 hook 내부로 집중
5. 기존 `store/authAtom.ts` 제거 또는 deprecated wrapper로 축소
6. 모든 consumer를 selector 기반으로 전환

### A-5. 권장 설계

권장 구조:

- `authSessionAtom`
  - `{ status, user }`
- `isAuthenticatedAtom`
  - derived selector
- `authBootstrap()`
  - 앱 시작 시 서버 세션 조회
- `useAuthActions()`
  - login callback / logout / refresh

권장하지 않는 구조:

- UI용 단순 문자열 atom과 상세 atom을 병행 유지
- 쿠키 감지 기반 상태와 서버 응답 기반 상태를 동시에 진실 소스로 사용

### A-6. 완료 기준

- 새로고침 후 세션 복구가 한 흐름으로 설명 가능
- 로그인 직후, 로그아웃 직후, auth callback 직후 상태가 일관됨
- board/invest/topbar가 같은 기준으로 auth를 인식
- 중복 auth API가 제거되거나 용도가 문서로 명확히 구분됨

### A-7. 검증 시나리오

필수 수동 검증:

1. 비로그인 상태 앱 첫 진입
2. 로그인 후 새로고침
3. 로그아웃 직후 TopBar/Board/Invest 표시 확인
4. Kakao callback 후 registered / pending_terms 분기 확인
5. 세션 만료 상태에서 보호 UI 동작 확인

권장 자동 검증:

- auth selector unit test
- logout transition test
- bootstrap success/failure test

### A-8. 기대 효과

- auth 관련 UI 불일치 버그 감소
- 인증 흐름 디버깅 난이도 하락
- 후속 watchlist/news 권한 처리 리팩토링 기반 확보

---

## Track B. 운영/배포 기준선 정리

### B-1. 목표 상태

현재 프로젝트에서 "공식 운영 경로"를 한 문서로 고정한다.

정리할 기준:

- 현재 실서비스 기준 환경
- 프론트 배포 경로
- 백엔드 배포 경로
- OAuth redirect URI 기준
- CORS 기준
- 네트워크/프록시 기준

### B-2. 현재 문제

현재 배포 서사는 여러 개다.

- Vercel + Railway
- GitHub Actions + GHCR + self-hosted runner
- Oracle Cloud/systemd
- 로컬 docker-compose + nginx

이 상태에서는 코드 리팩토링 때마다 다음 질문이 반복된다.

- 어떤 env를 기준으로 테스트해야 하는가
- 어떤 도메인이 production인가
- 어떤 배포 문서가 최신인가

### B-3. 대상 문서 후보

- `docs/DEPLOY-STATUS.md`
- `docs/WORKLOG-20260418-SYNC-AND-BACKUP.md`
- `alpha-terminal-ai-server/docs/deployment/CICD-GITHUB-ACTIONS.md`
- `alpha-terminal-frontend/docs/DEPLOY-ORACLE-CLOUD.md`
- 루트 `docker-compose.yml`

### B-4. 실행 순서

1. 현재 실제 서비스 도메인/인스턴스/배포 경로 확인
2. "현재 운영 기준" 문서 1개 선정
3. 나머지 문서는 `legacy`, `alternate`, `local-only`로 재분류
4. env/CORS/OAuth/network 기준을 표로 고정
5. 루트 README 또는 운영 문서에서 진입 링크를 하나로 통일

### B-5. 완료 기준

- 팀원이 "어디가 현재 운영 기준인가"를 한 문서로 알 수 있음
- OAuth redirect, backend URL, CORS 기준이 하나로 설명됨
- 대체 배포 문서는 현재 운영 기준과 분리 표기됨

### B-6. 기대 효과

- 배포/환경 관련 회귀 감소
- env drift와 문서 오해 감소
- 백엔드 migration 작업 시 검증 환경 확정이 쉬워짐

---

## Track C. 백엔드 Migration 체계 전환 준비

### C-1. 목표 상태

현재 백엔드 DB 변경 관리 방식은 아래 상태로 이동해야 한다.

- `create_all()` 중심 초기화 제거
- 수동 컬럼 추가 SQL 제거
- 버전드 migration이 MySQL 기준 운영 절차의 중심이 됨

주의:

이번 Phase 1에서 반드시 "모든 migration 전환 완료"까지 갈 필요는 없다.
하지만 최소한 **baseline 생성 + 전환 절차 합의 + 위험 구간 식별**까지는 끝내야 한다.

### C-2. 현재 문제

현재 구조는 다음과 같다.

- MySQL: `Base.metadata.create_all()` + `main.py` 내부 `_run_column_migrations()`
- PostgreSQL: `alembic/env.py`에서 `PgBase.metadata`

즉, 데이터스토어마다 관리 방식이 다르다.

문제:

- deploy 시 암묵적 schema 변경 발생
- 변경 이력 추적 어려움
- rollback 불가 또는 고비용
- 환경별 스키마 차이 가능성

### C-3. 대상 파일

- `alpha-terminal-ai-server/main.py`
- `alpha-terminal-ai-server/alembic/env.py`
- `alpha-terminal-ai-server/app/infrastructure/database/session.py`
- `alpha-terminal-ai-server/app/infrastructure/database/pg_session.py`
- ORM 정의 파일들
- 관련 DB 운영 문서

### C-4. 세부 작업

#### C-4-1. 스키마 inventory

해야 할 일:

- MySQL ORM 기반 테이블 목록 수집
- `_run_column_migrations()`가 다루는 컬럼 목록 정리
- 실제 운영 DB와 ORM 모델 차이 확인
- Postgres는 어떤 기능이 실제 운영에 필요한지 구분

산출물:

- `migration-inventory` 문서 또는 표

#### C-4-2. migration 전략 결정

선택지:

1. MySQL용 Alembic을 정식 채택
2. DB별 migration 경로를 분리하되 문서화와 실행 경로를 명확히 유지

권장:

- 운영 주 DB가 MySQL이라면 MySQL 기준 Alembic 체계를 우선 확립

#### C-4-3. baseline 생성

해야 할 일:

- 현재 운영 스키마를 기준으로 baseline revision 생성
- 이후 신규 컬럼/인덱스 추가는 revision으로만 수행

주의:

- baseline 생성 전에 운영 DB 백업 필수
- baseline 이후 `create_all()`은 점진적으로 제거

#### C-4-4. 호환 전환 단계

권장 접근:

1. baseline revision 추가
2. 신규 변경부터 revision-only로 적용
3. `_run_column_migrations()`는 단기 호환 레이어로만 유지
4. 1~2 배포 주기 확인 후 제거

### C-5. 완료 기준

- MySQL 기준 migration 운영 방식이 문서화됨
- baseline revision이 존재함
- 신규 스키마 변경은 `main.py` 수동 SQL 대신 revision으로 처리하는 원칙 확정
- `create_all()` 제거 또는 제거 일정이 합의됨

### C-6. 검증 시나리오

1. 빈 로컬 DB에서 baseline + 최신 revision 적용
2. 기존 운영 스키마에서 migration dry run
3. 신규 컬럼 1개 추가를 revision 방식으로 재현
4. 앱 시작 시 schema 자동 변경이 더 이상 필수 조건이 아님을 확인

### C-7. 기대 효과

- 배포 재현성 향상
- DB 변경 리스크 감소
- 도메인 확장 시 운영 부채 증가 속도 완화

---

## 4. 권장 실행 순서

가장 안전한 순서는 다음과 같다.

### Step 1. Frontend Auth 통합

이유:

- 사용자 영향이 즉시 크고
- 백엔드 스키마 작업과 독립적으로 진행 가능
- 비교적 빠르게 완료 기준을 확인할 수 있음

### Step 2. 운영/배포 기준선 문서화

이유:

- 이후 migration 검증 환경을 확정해야 하기 때문

### Step 3. Backend Migration Inventory + Baseline

이유:

- 영향 반경이 가장 크므로, 앞선 두 단계로 기준을 확정한 뒤 진행하는 편이 안전함

---

## 5. 일정 제안

보수적으로 잡으면 다음 정도가 적당하다.

### Day 1~2

- 프론트 auth consumer inventory
- 상태모델 설계 확정
- bootstrap/logout 흐름 통합

### Day 3

- auth consumer 치환
- 수동 검증 + 최소 자동 테스트 추가

### Day 4

- 현재 운영 기준 문서 확정
- 관련 문서 링크 정리

### Day 5~7

- MySQL schema inventory
- baseline 전략 확정
- migration 초안/문서화

### Day 8+

- baseline 적용 검증
- `create_all()` / 수동 migration 제거 계획 수립

---

## 6. 위험 요소와 대응

### 위험 1. 프론트 auth 리팩토링 후 일부 화면이 의도와 다르게 잠김

대응:

- consumer 목록을 먼저 고정
- 로그인/로그아웃/세션복구 회귀 테스트 필수

### 위험 2. Migration baseline이 현재 운영 DB와 맞지 않음

대응:

- baseline 생성 전에 실제 스키마 inventory
- 운영 DB 백업과 dry run 선행

### 위험 3. 배포 기준 문서화 전에 잘못된 환경을 기준으로 리팩토링

대응:

- 문서 정리 작업을 migration 작업보다 앞에 배치

---

## 7. Definition of Done

Phase 1은 아래 조건을 만족하면 완료로 본다.

- 프론트 auth 상태가 하나의 기준으로 동작한다.
- auth 관련 핵심 시나리오가 수동 테스트로 재현 가능하다.
- 현재 운영 기준 문서가 하나로 정리된다.
- MySQL 기준 migration 운영 방향과 baseline 절차가 확정된다.
- 이후 신규 DB 변경을 `main.py` 수동 SQL에 더 이상 추가하지 않는 원칙이 합의된다.

---

## 8. 다음 단계 연결

Phase 1 완료 후 바로 이어질 Phase 2 우선 항목은 아래와 같다.

1. 프론트 watchlist/news/dashboard/youtube 데이터 패칭 규칙 SWR 중심으로 통일
2. 백엔드 pipeline orchestration을 router에서 application service로 분리
3. scheduler entrypoint 단일화

즉, Phase 1은 "정합성 복구", Phase 2는 "구조 정리"다.

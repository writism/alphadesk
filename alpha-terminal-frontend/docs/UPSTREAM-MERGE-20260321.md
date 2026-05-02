# Upstream Merge 결과 (2026-03-21)

> 원본 레포: `EDDI-RobotAcademy/alpha-desk-frontend`
> 우리 포크: `writism/alpha-desk-frontend`

---

## Upstream 커밋 목록 (10개)

| 커밋 | 내용 |
|------|------|
| `acccb34` | Merge PR #7 — 환경변수 설정, 인증 플로우 구현 [ADF-6,7,8] |
| `8de2c39` | feat: 환경 변수 설정, 인증 플로우 구현 [ADF-6,7,8] |
| `c908dfe` | fix: 파이프라인 완료 후 summaries 조회 타이밍 보정 |
| `5561bad` | fix: fetchSummaries async 처리 및 콘솔 로그 추가 |
| `b832f64` | fix: 파이프라인 실행 버튼 로딩 상태 표시 개선 |
| `d06e16b` | feat: 대시보드 실제 API 연동 — /pipeline/summaries |
| `540a77d` | feat: watchlist API 연동 [ADF-4], summary mock data [ADF-5] |
| `d80b4af` | summary mock data 연결 [ADF-5] |
| `4bb59cb` | watchlist API 연동 [ADF-4] |
| `42b3642` | chore: .claude 설정 파일 gitignore 처리 |

---

## 파일별 머지 판단

| 파일 | 판단 | 이유 |
|------|------|------|
| `infrastructure/config/env.ts` | **우리 유지** | `env` 명칭 통일, 단순화된 검증 로직 |
| `infrastructure/http/httpClient.ts` | **우리 유지** | FE-03: `!res.ok` 에러 throw 적용됨 |
| `infrastructure/api/authApi.ts` | **무시** | 우리 `features/auth/` DDD 구조 유지 |
| `infrastructure/api/watchlistApi.ts` | **무시** | 우리 `features/watchlist/` DDD 구조 유지 |
| `infrastructure/api/summaryApi.ts` | **무시** | `runPipeline()`만 우리 구조로 이식 |
| `app/layout.tsx` | **우리 유지** | Jotai `<Provider>` + `AppLayout` 구조 |
| `app/auth-callback/page.tsx` | **우리 유지** | FE-04 아키텍처 준수 (`useAuth` 훅 사용) |
| `app/watchlist/page.tsx` | **우리 유지** | 시장 드롭다운, 단일 입력 UX |
| `app/dashboard/page.tsx` | **머지** | pipeline 실행 버튼 추가 |
| `app/components/StockSummaryCard.tsx` | **upstream 적용** | sentiment 배지 + 신뢰도 바 추가 |
| `app/mocks/summaryMocks.ts` | **upstream 적용** | 새 파일, TagItem 타입 + mock 데이터 |
| `components/NavBar.tsx` | **무시** | 우리 `ui/layout/Navbar.tsx`가 auth-aware로 우수 |
| `.gitignore` | **머지** | `.claude/` 항목 추가 |

---

## 우리에서 이식한 항목 (upstream → our structure)

### `runPipeline()` 기능
upstream의 `summaryApi.runPipeline()`을 우리 DDD 구조로 이식:

```
features/dashboard/infrastructure/api/dashboardApi.ts  ← runPipeline() 추가
features/dashboard/application/hooks/useDashboard.ts   ← executePipeline() 추가
app/dashboard/page.tsx                                  ← 실행 버튼 + 로딩 UI 추가
```

### `StockSummaryCard` 개선
upstream의 시각적 개선을 우리 타입(`tags: string[]`)에 맞게 적용:
- sentiment 배지 (긍정/부정/중립 + 점수)
- 신뢰도 바 (progress bar)
- 두 필드 모두 `optional`로 처리하여 하위 호환성 유지

---

## 아키텍처 차이 요약

| 항목 | Upstream | 우리 |
|------|---------|------|
| 구조 | 플랫 (`infrastructure/api/*.ts`) | DDD feature-based (`features/*/`) |
| 인증 | `/authentication/me` API 호출 | Cookie 기반 (`nickname`, `email`, `account_id`) |
| Navbar | 정적 링크만 | auth 상태 연동, Dashboard/Watchlist 메뉴 |
| 상태 관리 | 없음 (useState만) | Jotai atoms + Provider |
| HTTP | 에러 처리 없음 | `!res.ok` → throw |
| 로그아웃 | `/auth/logout` (Bearer 전용) | `/account/logout` (쿠키 기반) |

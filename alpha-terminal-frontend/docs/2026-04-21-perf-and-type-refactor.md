# 2026-04-21 프론트엔드 리팩토링 — 성능 · 타입

> 교차 저장소 리포트: [../../docs/REFACTORING-20260421-PERF-AND-TYPES.md](../../docs/REFACTORING-20260421-PERF-AND-TYPES.md)

## 핵심 변경

### 타입 경계

- `infrastructure/http/httpClient.ts` 에 `requestJson<T>(path, init?, parse?)` 헬퍼 추가.
  - 절대 URL / 상대 경로 자동 처리.
  - `parse` 가 있으면 런타임 검증 결과, 없으면 `raw as T`.
- `features/dashboard/infrastructure/api/dashboardApi.ts` 의 `res.json()` 에 명시적 `as T` 적용.
- `app/board/read/[id]/page.tsx` 의 `fetchHeatmapForSymbol` 에 `HeatmapResponse` 타입 적용 + 옵셔널 체인 안전화.
- 비-null 단언 5곳 모두 제거:
  - `linkedCardId!`, `heatmapSymbol!`, `sharedCard!.summary` (`board/read`)
  - `res.body!.getReader()` (`investApi.ts`)

### 성능

- `features/news/ui/components/NewsListPage.tsx`: `NewsItem` 을 `React.memo` 로 분리 (onSave 는 이미 useCallback 안정).
- `app/board/read/[id]/page.tsx`: `StockSummaryCard`, `ShareActionBar` 를 `next/dynamic` 으로 코드 스플릿. `StockSummaryCard` 에는 skeleton `loading` 플레이스홀더 지정.

## 보류

- **`noUncheckedIndexedAccess`** 활성화는 별도 PR. 파일별 오류 집계 후 점진적으로 머지.
- **`ClientShell` 경계 축소**: TopBar/SideBar/StatusFooter 의 클라이언트 훅 의존도 평가 후 별도 작업.
- **`requestJson<T>` 전면 마이그레이션**: 이번엔 헬퍼만 도입. `features/**/infrastructure/api/*.ts` 순차 전환 권장.

## 검증

- `tsc --noEmit` 0 오류.
- 비-null 단언 0건 (`rg '[a-zA-Z_0-9\)\]]!\\.'` 매칭 없음).

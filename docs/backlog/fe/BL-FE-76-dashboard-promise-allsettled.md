# BL-FE-76: 대시보드 API 부분 실패 시 전체 화면 오류 방지

## 문제

`useDashboard.ts`의 `fetchDashboardData()`가 `Promise.all()`을 사용해
3개 API(summaries, reportSummaries, analysisLogs) 중 1개라도 실패하면
나머지 2개가 성공해도 SWR이 전체를 오류 상태로 처리한다.

결과:
- `data` 전체가 `undefined`
- 대시보드 전체 화면에 에러 배너 + 빈 섹션 표시

## 해결 방안

`Promise.allSettled()`로 교체하고 실패 시나리오를 세분화한다.

| 시나리오 | 동작 |
|---|---|
| 401 포함 | 즉시 throw → SWR 에러 → 재로그인 유도 (기존 유지) |
| 3개 모두 실패 | throw → SWR 에러 → 에러 배너 + RETRY (기존 유지) |
| 1~2개 실패 | 성공한 데이터만 반환, 실패한 섹션은 `[]` → 부분 데이터 표시 |

## 범위

- `features/dashboard/application/hooks/useDashboard.ts`

## 완료 기준

- API 1개 실패해도 나머지 2개 섹션 정상 표시
- 401·전체 실패는 기존 에러 처리 그대로 유지
- `page.tsx` 변경 없음

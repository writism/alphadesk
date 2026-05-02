# BL-FE-65: 관리자가 /admin 대시보드에서 서비스 성장 지표를 확인한다

> **담당**: 김동녁 | **단계**: 관리자 기능 | **주차**: Week 2~3

## 배경

6차 회의 결정: ADMIN 역할 사용자만 접근 가능한 관리자 대시보드가 필요하다.
Retention, Dwell Time, CTR 지표를 시각화하여 서비스 성장을 모니터링한다.

## Success Criteria

- `/admin` 페이지는 ADMIN 역할 사용자만 접근 가능하다 (NORMAL 또는 미로그인 시 `/` 리다이렉트)
- Retention 차트: D-1 ~ D-14 재방문률이 선 그래프 또는 막대 그래프로 표시된다
- Dwell Time: 사용자 평균 체류 시간이 수치 카드로 표시된다
- CTR: 카드 클릭률이 수치 카드로 표시된다
- `GET /api/admin/dashboard/stats` 호출 결과를 렌더링한다

## To-do

- [ ] `AdminDashboardStats` 도메인 모델 정의 (`features/admin/domain/model/adminDashboardStats.ts`)
- [ ] `getAdminDashboardStats()` API 함수 구현 (`features/admin/infrastructure/api/adminApi.ts`)
- [ ] `useAdminDashboard` 훅 구현 (`features/admin/application/hooks/useAdminDashboard.ts`)
- [ ] ADMIN 역할 확인 로직 구현 (현재 사용자 role 체크)
- [ ] Retention 차트 컴포넌트 구현 (recharts 사용 권장)
- [ ] Dwell Time / CTR 수치 카드 컴포넌트 구현
- [ ] `AdminDashboardPage` 조립 (`features/admin/ui/components/AdminDashboardPage.tsx`)
- [ ] `app/admin/page.tsx` 라우트 생성 + ADMIN 가드 적용

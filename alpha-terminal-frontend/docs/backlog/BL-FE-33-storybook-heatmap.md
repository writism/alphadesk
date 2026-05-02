# BL-FE-33

**Backlog Type**  
DX / Testing

**Backlog Title**  
Storybook 도입 — `StockDailyReturnsHeatmap` 시각·접근성 회귀용 스토리

---

## 1. 배경

- 히트맵은 색·범례·한국장 각주 등 **시각 회귀**에 스토리북이 적합하다.

## 2. 목표

| ID | 기준 |
|----|------|
| SC-1 | `npm run storybook`으로 Storybook이 기동한다. |
| SC-2 | `StockDailyReturnsHeatmap`에 **픽스처 데이터** 스토리가 1개 이상 있다(KR/US 예시). |

## 3. 비범위

- 전 앱 컴포넌트 커버리지, Chromatic 연동(후속).

## 3.1 구현 메모

- Next 16과 `@storybook/nextjs` SWC 로더(`swc.isWasm`) 충돌로 **프레임워크는 `@storybook/react-vite`** 를 사용한다. 히트맵은 순수 클라이언트 컴포넌트라 Vite 프리뷰로 충분하다.

## 4. 관련 백로그

- **BL-FE-30**

## 5. 완료 정의

- [x] Storybook 설정 + 스토리 파일.
- [x] `package.json`에 `storybook` 스크립트.

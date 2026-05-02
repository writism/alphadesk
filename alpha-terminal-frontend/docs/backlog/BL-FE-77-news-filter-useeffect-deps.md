# BL-FE-77: useNewsList useEffect 의존성 배열 누락으로 필터 갱신 미작동 가능

## 문제

`useNewsList.ts`의 `useEffect` 의존성 배열에 `fetchPage`·`setState`가 빠져 있고,
`// eslint-disable-next-line react-hooks/exhaustive-deps`로 lint 경고를 억제 중.

```typescript
useEffect(() => {
    if (isLoggedIn) {
        fetchPage(1, marketFilter)
    }
    ...
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [isLoggedIn, marketFilter])  // fetchPage, setState 누락
```

`fetchPage`·`setState`(Jotai)는 참조 안정적이라 실제 무한 루프 위험은 없지만,
React 클로저 규칙상 의존성 선언이 잘못되어 있어 향후 변경 시 stale closure 버그로
이어질 수 있고, React Strict Mode·Fast Refresh 환경에서 간헐적으로
필터 변경 후 목록이 갱신되지 않는 경우가 발생할 수 있다.

추가로 `changeMarket`의 `useCallback` deps도 `[]`로 비어 있어 동일 문제.

## 해결 방안

- `useEffect` deps에 `fetchPage`, `setState` 추가
- `eslint-disable` 주석 제거
- `changeMarket`의 `useCallback` deps에 `setMarketFilter` 추가

## 범위

- `features/news/application/hooks/useNewsList.ts`

## 완료 기준

- ESLint `react-hooks/exhaustive-deps` 경고 없음
- 동작 변화 없음 (Jotai setter 참조 안정성 보장)

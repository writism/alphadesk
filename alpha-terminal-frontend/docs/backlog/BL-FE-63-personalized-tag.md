# BL-FE-63: 분석 결과 카드에 개인화 태그가 표시된다

> **담당**: 이승욱 | **단계**: 2단계 | **주차**: Week 2~3

## 배경

AI 분석이 사용자 프로필 기반으로 개인화된 경우,
카드에 "맞춤 분석" 배지를 표시하여 사용자가 인지할 수 있게 한다.

## Success Criteria

- 분석 API 응답의 `personalized: true` 필드를 감지하면 카드에 "맞춤 분석" 배지가 표시된다
- 배지는 카드 우상단에 작은 태그 형태로 표시된다
- `personalized: false` 또는 필드 없음이면 배지가 표시되지 않는다

## To-do

- [ ] `StockSummaryCard` 컴포넌트에 `personalized?: boolean` prop 추가
- [ ] `personalized === true`일 때 "맞춤 분석" 배지 렌더링
- [ ] 배지 스타일 정의 (기존 리스크 태그 스타일 참고)
- [ ] 분석 응답 도메인 모델에 `personalized` 필드 추가 (`features/dashboard/domain/model/stockSummary.ts`)

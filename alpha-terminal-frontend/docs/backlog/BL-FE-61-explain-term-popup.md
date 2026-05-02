# BL-FE-61: 뉴스/공시 카드에서 용어 클릭 시 AI 설명 팝업이 표시된다

> **담당**: 김동녁 | **단계**: 0단계 | **주차**: Week 1

## 배경

뉴스·공시 카드 본문의 금융 전문 용어(PER, EPS 등)를 클릭하면
AI가 쉽게 설명해주는 팝업이 표시되어 사용자 이해를 돕는다.

## Success Criteria

- 뉴스/공시 카드 본문에서 금융 용어 텍스트를 클릭하면 설명 팝업이 표시된다
- 팝업은 `POST /api/market-analysis/explain-term` 호출 결과를 보여준다
- 로딩 중 스피너, 오류 시 "설명을 불러올 수 없습니다" 메시지가 표시된다
- 팝업 외부 클릭 또는 ESC 키로 닫힌다
- 로그인 불필요 (비인증 사용자도 사용 가능)

## To-do

- [ ] `ExplainTermResponse` 도메인 모델 정의 (`features/market-analysis/domain/model/explainTerm.ts`)
- [ ] `explainTerm(term: string)` API 함수 구현 (`features/market-analysis/infrastructure/api/marketAnalysisApi.ts` 추가)
- [ ] `useExplainTerm` 훅 구현 (`features/market-analysis/application/hooks/useExplainTerm.ts`)
- [ ] `TermExplainPopup` 컴포넌트 구현 (`features/market-analysis/ui/components/TermExplainPopup.tsx`)
- [ ] 뉴스 카드 컴포넌트에 용어 클릭 이벤트 연결

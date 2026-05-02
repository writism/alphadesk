# BL-FE-55

**Backlog Type**
Feature / stock-recommendation / ui

**Backlog Title**
주식 추천 페이지 — 질문 입력 프롬프트 UI

**Success Criteria**
- 페이지 경로는 `/stock-recommendation`이다
- 질문 입력 텍스트 필드가 화면에 표시된다
- 질문 전송 버튼이 화면에 표시된다
- 질문 입력이 비어있으면 전송 버튼이 비활성화된다
- 입력 필드에 placeholder 텍스트가 표시된다
- 전송 후 백엔드(`POST /market-analysis/ask`) 응답이 표시된다

**Todo**
1. [x] 네비게이션 링크를 `/stock-theme` → `/stock-recommendation`으로 변경
2. [x] `features/stock-recommendation/` 도메인 모델, API, 훅, UI 컴포넌트 구현
3. [x] `app/stock-recommendation/page.tsx` 생성

**관련**
- [BL-BE-52](../../alpha-desk-ai-server/docs/backlog/BL-BE-52-market-analysis-langchain-qa.md) — 관심종목 LangChain Q&A API

**개정 이력**
- 2026-03-31: 초안 및 구현

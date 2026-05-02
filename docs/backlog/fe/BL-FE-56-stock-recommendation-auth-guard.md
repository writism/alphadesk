# BL-FE-56

**Backlog Type**
Feature / stock-recommendation / auth

**Backlog Title**
주식 추천 페이지 인증 가드 — 비인증 사용자 로그인 리다이렉트

**Success Criteria**
- 비인증 사용자가 /stock-recommendation 접근 시 /login 으로 리다이렉트된다
- 인증 상태 로딩 중에는 빈 화면을 표시한다 (flash 방지)
- 인증된 사용자는 질문 입력 및 결과 조회를 정상 수행할 수 있다
- API: POST /market-analysis/ask, request { question }, response { question, answer }

**Todo**
1. [x] StockRecommendationPrompt에 authAtom 기반 인증 가드 추가
2. [x] UNAUTHENTICATED 상태 시 /login 리다이렉트, 렌더 null 처리
3. [x] 백엔드 응답에 question 필드 추가, 프론트 타입 업데이트

**개정 이력**
- 2026-03-31: 초안 및 구현

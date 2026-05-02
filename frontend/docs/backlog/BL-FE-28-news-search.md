# BL-FE-28

**Backlog Type**
Behavior Backlog

**Backlog Title**
사용자가 종목을 선택하면 해당 종목의 뉴스를 조회한다

**의존성**
- 백엔드 `GET /news/search?keyword=&market=` 구현 완료 → BL-BE-10

**배경**
백엔드에서 미국 종목(SerpAPI + Finnhub), 한국 종목(SerpAPI + 네이버뉴스)을 합산하여
뉴스를 반환하는 API가 완성됐다. 프론트엔드에서 이를 호출하여 사용자에게 뉴스 목록을 제공한다.

**API 호출 방식**
```
GET /news/search?keyword={종목코드 또는 키워드}&market={US|KR}&page=1&page_size=10
```

- `market=US` — 미국 종목 (예: CXAI, AAPL)
- `market=KR` — 한국 종목 (예: 헥토파이낸셜, 삼성전자)
- `market` 생략 — SerpAPI 단독 (기존 동작)

**응답 타입**
```ts
interface NewsArticleItem {
  title: string
  snippet: string
  source: string
  published_at: string | null
  link: string | null
}

interface NewsSearchResponse {
  items: NewsArticleItem[]
  total_count: number
  page: number
  page_size: number
}
```

**Success Criteria**
- 종목 선택 시 해당 종목의 `symbol`과 `market`을 기반으로 뉴스 API를 호출한다
- `market`이 `NASDAQ` / `NYSE` 등 미국 시장이면 `market=US`로 전달한다
- `market`이 `KOSPI` / `KOSDAQ` 이면 `market=KR`로 전달한다
- 뉴스 목록을 제목, 출처, 날짜, 링크 형태로 표시한다
- 로딩 중에는 스켈레톤 또는 로딩 상태를 표시한다
- 뉴스가 없으면 "뉴스가 없습니다" 빈 상태를 표시한다
- 뉴스 항목 클릭 시 새 탭으로 원문 링크를 연다
- API 오류 시 에러 메시지를 표시한다

**구현 범위**

### 1. Domain Model
- 위치: `features/news/domain/model/newsArticle.ts`
- `NewsArticleItem`, `NewsSearchResponse` 타입 정의

### 2. Infrastructure — API
- 위치: `features/news/infrastructure/api/newsApi.ts`
- `searchNews(keyword: string, market: string, page?: number, page_size?: number): Promise<NewsSearchResponse>`
- `httpClient.get('/news/search?...')` 호출

### 3. Application — Hook
- 위치: `features/news/application/hooks/useNewsSearch.ts`
- `symbol`과 `market`을 받아 API 호출
- `market` → `US` / `KR` 변환 로직 포함
  - `NASDAQ`, `NYSE` → `US`
  - `KOSPI`, `KOSDAQ` → `KR`
- 상태: `articles`, `isLoading`, `error`

### 4. UI Component
- 위치: `features/news/ui/components/NewsArticleList.tsx`
- `articles: NewsArticleItem[]`, `isLoading: boolean`, `error: string | null` props
- 각 항목: 제목(링크), 출처, 날짜 표시
- 빈 상태 / 로딩 상태 처리

**Todo**
1. `features/news/domain/model/newsArticle.ts` — 타입 정의
2. `features/news/infrastructure/api/newsApi.ts` — API 호출 함수 구현
3. `features/news/application/hooks/useNewsSearch.ts` — 훅 구현 (market 변환 포함)
4. `features/news/ui/components/NewsArticleList.tsx` — 뉴스 목록 컴포넌트 구현
5. 뉴스를 노출할 페이지 또는 컴포넌트에 `useNewsSearch` + `NewsArticleList` 연결

# BL-FE-59 전체 페이지 UI 레이아웃 통일

## 배경

6개 메뉴(HOME, DASHBOARD, WATCHLIST, BOARD, STOCK_PICKS, VIDEOS) 간 콘텐츠 영역 폭, 패딩, 타이틀 표기가 제각각이라 통일감이 없음.
DASHBOARD와 VIDEOS는 full-width로 넓게 나오고, 나머지는 max-w-2xl/3xl로 좁게 나오며, STOCK_PICKS는 타이틀이 한글 "주식 추천"으로 표기됨.

## 현황 (불일치 항목)

| 페이지 | max-width | 패딩 | 타이틀 언어 |
|---|---|---|---|
| HOME | max-w-2xl | px-4 py-8 | 영문 |
| DASHBOARD | 없음(full) | p-6 pt-8 md:p-8 | 영문 |
| WATCHLIST | max-w-2xl | p-6 pt-8 md:p-8 | 영문 |
| BOARD | max-w-3xl | p-6 pt-8 md:p-10 | 영문 |
| STOCK_PICKS | max-w-2xl | p-6 pt-8 md:p-8 | **한글 "주식 추천"** |
| YOUTUBE | 없음(full) | p-6 pt-8 md:p-8 | 영문 |

## 목표

반응형 기준으로 모든 페이지가 통일된 레이아웃을 갖도록 수정.

## 구현 스펙

### 1. 공통 컨테이너 기준

모든 페이지의 최상위 `<main>` (또는 최상위 wrapper):
```
max-w-5xl mx-auto w-full p-6 pt-8 md:p-8
```
- `max-w-5xl` (1024px): 모바일/태블릿/데스크탑 모두에서 적당한 폭
- DASHBOARD는 내부 그리드가 있으므로 `max-w-6xl`도 허용

### 2. 수정 대상 파일

| 파일 | 변경 내용 |
|---|---|
| `app/page.tsx` | `mx-auto max-w-2xl px-4 py-8` → `max-w-5xl mx-auto p-6 pt-8 md:p-8` |
| `app/dashboard/page.tsx` | `p-6 pt-8 md:p-8` → `max-w-6xl mx-auto p-6 pt-8 md:p-8` |
| `app/watchlist/page.tsx` | `min-h-screen p-6 pt-8 md:p-8 max-w-2xl mx-auto` → `max-w-5xl mx-auto p-6 pt-8 md:p-8` |
| `app/board/page.tsx` | `p-6 pt-8 md:p-10 max-w-3xl mx-auto` → `max-w-5xl mx-auto p-6 pt-8 md:p-8` |
| `features/stock-recommendation/ui/components/StockRecommendationPrompt.tsx` | max-width 통일 + 타이틀 "주식 추천" → "STOCK_PICKS" |
| `features/youtube/ui/components/YoutubeVideoFeed.tsx` | `p-6 pt-8 md:p-8` → `max-w-6xl mx-auto p-6 pt-8 md:p-8` |

### 3. 헤더 구조 통일

모든 페이지 헤더:
```tsx
<header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-outline pb-4">
  <div>
    <div className="font-headline font-bold text-on-surface text-xl uppercase tracking-tighter">
      PAGE_TITLE
    </div>
    <div className="font-mono text-sm text-on-surface-variant mt-0.5">
      subtitle
    </div>
  </div>
  {/* 우측 액션 버튼 (있는 경우) */}
</header>
```

### 4. STOCK_PICKS 타이틀 수정

`StockRecommendationPrompt.tsx`:
- 타이틀: `"주식 추천"` → `"STOCK_PICKS"`
- 서브타이틀: `"관심종목 테마를 기반으로 AI가 질문에 답변합니다."` 유지

## 완료 조건

- [ ] 6개 페이지 모두 동일한 max-width 컨테이너 사용
- [ ] 모바일/데스크탑 패딩 통일 (pt-8 유지)
- [ ] STOCK_PICKS 타이틀 영문 대문자로 수정
- [ ] 헤더 구조 (타이틀+서브타이틀+액션버튼) 일관성 확보
- [ ] 데스크탑에서 시각적으로 균일한 콘텐츠 폭 확인

# Alpha Desk 앱 아키텍처 개선 제안서

> 작성일: 2026-04-15 | 작성자: 이승욱
> 대상: 팀장, 개발팀 전원
> 목적: UX 품질 향상 + API 비용 절감 + 사용자 경험 일관성 확보

---

## TL;DR (핵심 요약)

| 영역 | 현재 문제 | 제안 | 기대 효과 |
|------|----------|------|----------|
| **데이터 신선도** | 모든 페이지가 매번 API 재호출 | 콘텐츠 유형별 TTL 캐싱 도입 | API 호출 60~80% 감소 |
| **분석 결과 캐싱** | 같은 종목 분석을 반복 실행 | DB 저장 + 캐시 히트 시 즉시 반환 | LLM API 비용 대폭 절감 |
| **관심종목 위치** | 독립 메뉴 (8개 중 1개 차지) | 사용자 설정으로 이동 + 전역 접근 유지 | 메뉴 1개 축소 |
| **메뉴 구조** | 8개 평면 나열 (모바일 과다) | 데스크톱 그룹핑 + 모바일 4탭 | UX 가이드라인 준수 |

**이 문서가 제안하는 변경은 기능 삭제가 아니라 "같은 기능을 더 적은 비용으로, 더 빠르게, 더 깔끔하게" 제공하는 것입니다.**

---

## 목차

1. [문제 진단: 현재 앱의 3가지 비효율](#1-문제-진단)
2. [제안 1: 데이터 신선도 전략 (TTL 캐싱)](#2-데이터-신선도-전략)
3. [제안 2: 분석 결과 DB 캐싱](#3-분석-결과-db-캐싱)
4. [제안 3: 관심종목을 사용자 설정으로 이동](#4-관심종목-위치-재배치)
5. [제안 4: 메뉴 구조 재편](#5-메뉴-구조-재편)
6. [구현 로드맵](#6-구현-로드맵)
7. [부록: 근거 자료](#7-부록)

---

## 1. 문제 진단

### 1-1. 모든 페이지가 매번 처음부터 데이터를 가져온다

현재 페이지별 데이터 fetching 현황:

| 페이지 | 훅 | 호출 시점 | 캐싱 | 문제 |
|--------|-----|----------|------|------|
| DASHBOARD | `useDashboard` | 마운트마다 | **없음** | `Promise.all` 3건 매번 재호출 |
| NEWS | `useNewsList` | 마운트 + 필터 변경 | **없음** (Jotai atom) | 관심종목 기반 뉴스를 매번 SERP API 호출 |
| VIDEOS | `useYoutubeList` | 마운트 + 종목 변경 | **없음** | YouTube API 매번 호출 (일일 할당량 소진 위험) |
| WATCHLIST | `useWatchlist` | 마운트마다 | **없음** | 매번 GET /watchlist |
| INVEST | `useInvestJudgment` | 사용자 제출 시 | 해당 없음 | 동일 질문 재제출 시 LLM 재실행 |

**유일한 예외**: `useDailyReturnsHeatmap` — 10분 TTL 인메모리 캐시 적용 (올바른 패턴)

> **시나리오**: 사용자가 DASHBOARD → NEWS → DASHBOARD로 이동하면
> DASHBOARD의 3건 API가 **2번** 호출됩니다. 데이터는 동일한데 비용은 2배입니다.

### 1-2. 분석 결과가 휘발된다

- AI 투자 판단(`INVEST`)과 대시보드 파이프라인(`DASHBOARD`)이 생성하는 분석 결과는 **현재 세션에서만 존재**
- 5분 전에 "삼성전자 투자 판단"을 요청했어도, 다시 요청하면 **동일한 LLM 파이프라인이 처음부터 재실행**
- LLM API 호출 1건당 비용: GPT-4 기준 $0.03~0.12 / Claude 기준 $0.015~0.075
- **동일 종목 + 유사 시점의 반복 분석은 순수 비용 낭비**

### 1-3. 모바일에서 메뉴 8개는 과다하다

| 기준 | 권장 | Alpha Desk | 판정 |
|------|------|-----------|------|
| Material Design 3 | 3~5개 | 8개 | **초과** |
| Apple HIG (Tab Bar) | 최대 5개 | 8개 | **초과** |
| Hick's Law 관점 | 적을수록 유리 | 8개 | 의사결정 시간 1.5배 |
| 업계 벤치마크 (토스/카카오/Robinhood) | 4~5개 | 8개 | **초과** |

> 상세 분석: [`docs/navigation-menu-analysis.md`](./navigation-menu-analysis.md) 참조

---

## 2. 데이터 신선도 전략

### 핵심 아이디어

**모든 데이터를 동일하게 취급하지 말자.** 콘텐츠 유형마다 "신선"의 기준이 다르다.

### 콘텐츠 유형별 TTL 설계

| 콘텐츠 | 변동 빈도 | 권장 TTL | 근거 |
|--------|----------|---------|------|
| **관심종목 목록** | 사용자 변경 시만 | **∞** (변경 이벤트 시 무효화) | 사용자 액션 기반, 시간 무관 |
| **뉴스 목록** | 수시 | **10분** | 뉴스는 분 단위로 갱신되나, 10분 이내 재방문 시 동일 결과 |
| **YouTube 영상** | 일 1~2회 | **30분** | 채널별 업로드 빈도 낮음, API 할당량 보호 |
| **대시보드 요약** | 파이프라인 실행 시 | **10분** | 시장 데이터 기반이나 실시간 아님 |
| **히트맵** | 장중 변동 | **10분** (현재 적용 중) | 이미 올바르게 구현됨 |
| **AI 분석 결과** | 요청마다 생성 | **1시간** (DB 캐싱) | 같은 종목의 시장 상황은 1시간 내 급변하지 않음 |
| **게시판** | 사용자 글 작성 시 | **SWR** (현재 적용 중) | 이미 적용됨 |

### 구현 방식: SWR 전역 적용

현재 `swr@^2.4.1`이 이미 설치되어 있으나, `useSharedCards` 1곳에서만 사용 중입니다.

```
현재:  useEffect + useState (매번 fetch)
제안:  useSWR + dedupingInterval (TTL 내 재사용)
```

**SWR 전역 설정 예시**:

```typescript
// infrastructure/swr/swrConfig.ts
const swrConfig = {
  dedupingInterval: 10 * 60 * 1000,  // 10분 기본 TTL
  revalidateOnFocus: false,           // 탭 전환 시 재요청 방지
  revalidateOnReconnect: true,        // 네트워크 복구 시만 재요청
  errorRetryCount: 2,
}
```

**페이지별 적용**:

```typescript
// 뉴스: 10분 캐싱
useSWR(['/news', keywords, market, page], fetcher, { dedupingInterval: 10 * 60 * 1000 })

// YouTube: 30분 캐싱
useSWR(['/youtube', stockName], fetcher, { dedupingInterval: 30 * 60 * 1000 })

// 관심종목: 변경 시만 무효화
useSWR('/watchlist', fetcher, { revalidateOnMount: true })
// mutate('/watchlist') — add/remove 시 호출
```

### 효과 추정

| 시나리오 | 현재 API 호출 | 개선 후 | 절감률 |
|---------|-------------|---------|-------|
| DASHBOARD → NEWS → DASHBOARD (10분 이내) | 6건 | 3건 | **50%** |
| NEWS 탭 ↔ 다른 탭 왕복 5회 (30분) | 10건 | 3건 | **70%** |
| YouTube 3회 방문 (1시간) | 3건 | 2건 | **33%** |

### "오래된 뉴스/영상의 가치" 문제

> 사용자가 3일 전 뉴스를 보면서 "최신 정보"라고 오해하면 안 됩니다.

**해결**: 콘텐츠에 시간 기반 태그를 부착합니다.

```
[방금 수집] — 10분 이내
[오늘]     — 24시간 이내
[이번 주]  — 7일 이내
[오래됨]   — 7일 초과 → 시각적 비활성화 (opacity 50%)
```

이렇게 하면 캐시된 데이터를 보여주면서도 사용자가 데이터의 신선도를 즉시 파악할 수 있습니다.

---

## 3. 분석 결과 DB 캐싱

### 현재 흐름 (비효율)

```
사용자: "삼성전자 투자 판단" 요청
  → Retrieval (뉴스 + YouTube + DART) — 20~30초
  → LLM 분석 — 10~20초
  → 결과 반환

5분 후, 같은 사용자: "삼성전자 투자 판단" 재요청
  → Retrieval (뉴스 + YouTube + DART) — 20~30초  ← 동일한 작업 반복
  → LLM 분석 — 10~20초                          ← 동일한 작업 반복
  → 결과 반환
```

### 제안 흐름 (캐시 히트)

```
사용자: "삼성전자 투자 판단" 요청
  → DB 캐시 조회: (종목="삼성전자", 생성 시각 < 1시간)
  → 캐시 히트 → 저장된 결과 즉시 반환 (< 1초)
  → 응답에 "1시간 이내 분석 결과입니다" 표시
```

### DB 스키마 (백엔드)

```sql
CREATE TABLE analysis_cache (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    company      VARCHAR(100) NOT NULL,     -- 종목명
    query_hash   VARCHAR(64) NOT NULL,      -- 질문 해시 (유사 질문 매칭)
    result_json  JSON NOT NULL,             -- 분석 결과 전체
    created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at   DATETIME NOT NULL,         -- TTL 기반 만료
    account_id   BIGINT,                    -- 개인화 분석인 경우

    INDEX idx_company_expires (company, expires_at),
    INDEX idx_query_hash (query_hash)
);
```

### 캐시 정책

| 분석 유형 | TTL | 무효화 조건 |
|----------|-----|-----------|
| AI 투자 판단 (`/invest`) | **1시간** | 장 마감 후 리셋 |
| 대시보드 파이프라인 | **30분** | 사용자 수동 새로고침 |
| 종목 추천 (`/stock-recommendation`) | **2시간** | 일 1회 갱신 |

### 비용 절감 추정

| 항목 | 현재 (캐시 없음) | 캐시 적용 후 |
|------|---------------|------------|
| 동일 종목 재분석 | 매번 LLM 호출 | 캐시 히트 시 0원 |
| Retrieval (뉴스/YouTube/DART) | 매번 외부 API 호출 | 캐시 히트 시 0건 |
| 사용자 대기 시간 | 30~50초 | 캐시 히트 시 < 1초 |
| 일일 LLM API 비용 (10명 기준) | ~$5~15 | ~$1~3 (**70% 절감**) |

### 사용자 UX

```
[캐시 히트 시]
"1시간 이내 분석 결과입니다. 최신 분석을 원하시면 '새로 분석' 버튼을 눌러주세요."
[새로 분석] 버튼 → 캐시 무시하고 파이프라인 재실행
```

사용자에게 **선택권**을 줍니다. 빠른 결과 vs 최신 분석.

---

## 4. 관심종목 위치 재배치

### 현재: 독립 메뉴 1개를 차지

```
HOME | DASHBOARD | WATCHLIST | BOARD | NEWS | STOCK_PICKS | INVEST | VIDEOS
                   ^^^^^^^^^ 8개 중 1개
```

### 관심종목의 특성 분석

| 관점 | 분석 |
|------|------|
| **사용 빈도** | 초기 설정 후 간헐적 수정 (일 0~2회) |
| **핵심 기능 여부** | 핵심이지만 **설정(configuration)** 성격 |
| **다른 기능과의 관계** | NEWS, DASHBOARD, INVEST 모두 관심종목 기반 동작 |
| **업계 사례** | 토스증권: "관심" 탭, Robinhood: "Portfolio" 내 하위 |

### 업계 벤치마크: 관심종목 위치

| 앱 | 관심종목 위치 | 접근 방식 |
|----|------------|----------|
| **토스증권** | 하단 탭 "관심" (4개 중 1개) | 독립 탭이지만 총 4개라 부담 없음 |
| **카카오페이증권** | "주식" 탭 내 하위 섹션 | 통합 |
| **Robinhood** | Portfolio 화면 내 | 통합 |
| **Yahoo Finance** | 하단 탭 "Watchlist" | 독립 탭 (5개 중 1개) |
| **TradingView** | 사이드 패널 (항상 접근 가능) | 별도 패널 |

### 제안: 하이브리드 접근

**관심종목을 "사용자 설정"으로 이동하되, 전역 접근성은 유지**합니다.

```
[기존] WATCHLIST 메뉴 → 관심종목 전용 페이지

[제안]
1. 사용자 프로필/설정 페이지 내 "관심종목 관리" 섹션
2. 모든 페이지 상단에 "현재 관심종목" 칩(chip) 표시
3. 칩 클릭 → 빠른 종목 추가/삭제 팝오버
4. DASHBOARD에서 관심종목 기반 데이터 통합 표시
```

**장점**:
- 메뉴 1개 축소 (8 → 7)
- 관심종목이 "앱 전체를 관통하는 설정"이라는 멘탈 모델 강화
- 다른 페이지에서도 종목 관리 가능 (현재는 WATCHLIST 페이지로 이동해야 함)

**단점과 대응**:
- "관심종목을 자주 보는 사용자가 불편해할 수 있다"
  → 히트맵 + 종목 리스트는 DASHBOARD에 통합 표시
  → 빠른 접근은 전역 칩으로 보장

---

## 5. 메뉴 구조 재편

### 현재 구조의 문제

```
8개 메뉴가 동일한 위계로 나열됨
→ 사용자가 "어디서 뭘 하지?"를 매번 판단해야 함
→ 모바일에서 8개 하단 탭 = Material Design/Apple HIG 기준 위반
```

### 메뉴 기능 분류

현재 8개 메뉴를 **사용자 행동 기준으로 재분류**하면:

| 카테고리 | 메뉴 | 사용자 행동 |
|---------|------|-----------|
| **진입점** | HOME | 앱 시작 |
| **정보 탐색** | DASHBOARD, NEWS, VIDEOS | "시장이 어떻지?" |
| **AI 분석** | INVEST, STOCK_PICKS | "이 종목 어때?" |
| **설정/관리** | WATCHLIST | "내 관심종목 관리" |
| **커뮤니티** | BOARD | "다른 사용자와 소통" |

> 사용자는 "정보를 보러" 왔거나 "판단을 요청하러" 왔거나 "설정을 바꾸러" 온 것입니다.
> 이 3가지 의도에 맞게 메뉴를 재배치해야 합니다.

### 제안: 최종 메뉴 구조

#### 데스크톱 사이드바 (7개, 3그룹)

```
HOME
─────────────────
◆ 시장 분석
  DASHBOARD
  NEWS
  VIDEOS
─────────────────
◆ AI 투자
  INVEST
  STOCK_PICKS
─────────────────
BOARD
─────────────────
⚙ 설정 (하단 고정)
  → 관심종목 관리
  → 프로필/계정
```

**변경점**:
- WATCHLIST → 설정으로 이동 (메뉴 1개 축소)
- 그룹핑 구분선 추가 (인지 부하 감소)
- 설정 아이콘을 사이드바 하단에 고정 (토스, Notion 패턴)

#### 모바일 하단 네비게이션 (4개)

```
┌──────────┬──────────┬──────────┬──────────┐
│   HOME   │  MARKET  │  INVEST  │   MORE   │
│    🏠    │    📊    │    🤖    │    ≡     │
└──────────┴──────────┴──────────┴──────────┘
```

| 탭 | 포함 기능 | 근거 |
|----|----------|------|
| **HOME** | 메인 화면 | 진입점 (필수) |
| **MARKET** | DASHBOARD + NEWS + VIDEOS | "시장 정보" 통합 진입점 → 상단 세그먼트로 전환 |
| **INVEST** | AI 투자 판단 | **핵심 차별화 기능** — 항상 1탭 접근 가능해야 함 |
| **MORE** | STOCK_PICKS, BOARD, 설정(관심종목 포함) | 사용 빈도 낮은 기능 모음 |

### 메뉴 순서 설계 근거

메뉴 순서는 **사용자의 자연스러운 탐색 흐름**을 따릅니다:

```
1. HOME (시작) → 2. 시장 정보 탐색 → 3. AI 판단 요청 → 4. 나머지
```

이 순서는 **AIDA 모델** (Attention → Interest → Decision → Action)과 일치합니다:
- HOME: 주의 환기
- MARKET: 관심 유발 (시장 데이터)
- INVEST: 의사결정 지원 (AI 분석)
- MORE: 부가 기능

### 비교: 현재 vs 제안

| 항목 | 현재 | 제안 |
|------|------|------|
| 데스크톱 메뉴 수 | 8개 (평면) | 7개 (3그룹) |
| 모바일 탭 수 | **8개** | **4개** |
| 모바일 터치 타겟 | 360px ÷ 8 = **45px** (부족) | 360px ÷ 4 = **90px** (충분) |
| Material Design 준수 | **위반** | **준수** (3~5개) |
| Apple HIG 준수 | **위반** | **준수** (최대 5개) |
| 의사결정 시간 (Hick's Law) | `log₂(9)` = 3.17 | `log₂(5)` = 2.32 (**27% 감소**) |

---

## 6. 구현 로드맵

### Phase 1: 즉시 적용 가능 (1~2일, 프론트엔드만)

| 작업 | 영향 범위 | 난이도 |
|------|---------|-------|
| SWR 전역 Provider 설정 | `app/layout.tsx` | 낮음 |
| `useDashboard` → `useSWR` 전환 | Dashboard 훅 1개 | 낮음 |
| `useNewsList` → `useSWR` 전환 | News 훅 1개 | 중간 |
| `useYoutubeList` → `useSWR` 전환 | YouTube 훅 1개 | 낮음 |
| 데스크톱 사이드바 그룹핑 구분선 추가 | `SideBar.tsx` | 낮음 |

### Phase 2: 단기 (3~5일, FE + BE)

| 작업 | 영향 범위 | 난이도 |
|------|---------|-------|
| `analysis_cache` 테이블 + Repository 구현 | BE 신규 | 중간 |
| INVEST 페이지 캐시 히트 → 즉시 반환 로직 | BE UseCase | 중간 |
| 모바일 하단 탭 4개로 축소 | `MobileNavBar.tsx` | 중간 |
| MARKET 통합 페이지 (탭/세그먼트 전환) | 신규 페이지 | 중간 |

### Phase 3: 중기 (1~2주)

| 작업 | 영향 범위 | 난이도 |
|------|---------|-------|
| WATCHLIST → 설정 이동 + 전역 칩 UI | FE 다수 파일 | 높음 |
| 콘텐츠 신선도 태그 UI | FE 공통 컴포넌트 | 낮음 |
| 분석 캐시 만료 정책 고도화 (장중/장후 분리) | BE 정책 | 중간 |

### 우선순위 제안

```
Phase 1 (즉시)  ← 위험 없음, 효과 큼, 비용 낮음
  ↓
Phase 2 (단기)  ← 핵심 UX 개선, 비용 절감 시작
  ↓
Phase 3 (중기)  ← 구조적 개선, 충분한 논의 후 진행
```

---

## 7. 부록

### A. 이론적 근거

| 이론 | 핵심 내용 | 적용 |
|------|----------|------|
| **Miller's Law** (1956) | 단기 기억 용량 7±2개 | 데스크톱 8개 → 허용 범위 |
| **Cowan's Revision** (2001) | 실제 작업 기억 4±1개 | 모바일 8개 → **초과** |
| **Hick's Law** (1952) | 선택지 증가 → 의사결정 시간 로그 증가 | 메뉴 축소의 정량적 근거 |
| **선택 마비** (Schwartz, 2004) | 선택지 과다 → 만족도 하락 | 8개 → 4개로 축소 |
| **SWR 패턴** (HTTP RFC 5861) | stale-while-revalidate | 캐시 전략의 표준 |

### B. 금융 앱 벤치마크

| 앱 | 모바일 탭 | 캐싱 전략 | 관심종목 위치 |
|----|---------|----------|------------|
| 토스증권 | 4개 | 적극적 캐싱 | 독립 탭 (4개 중 1개) |
| 카카오페이증권 | 5개 | SWR | "주식" 탭 내 |
| Robinhood | 4개 | 적극적 캐싱 | Portfolio 내 |
| Yahoo Finance | 5개 | 세션 캐싱 | 독립 탭 (5개 중 1개) |

### C. 현재 코드 기준 캐싱 현황

```
✅ 캐싱 적용:  useDailyReturnsHeatmap (10분 TTL)
✅ SWR 적용:   useSharedCards
❌ 캐싱 없음:  useDashboard, useNewsList, useYoutubeList, useWatchlist
❌ 결과 저장:  useInvestJudgment (매번 LLM 재실행)
```

### D. 참고 자료

- Miller, G.A. (1956). "The Magical Number Seven, Plus or Minus Two." *Psychological Review*, 63(2), 81-97
- Cowan, N. (2001). "The magical number 4 in short-term memory." *Behavioral and Brain Sciences*, 24(1)
- Hick, W.E. (1952). "On the rate of gain of information." *Quarterly Journal of Experimental Psychology*
- Schwartz, B. (2004). *The Paradox of Choice.* HarperCollins
- Google Material Design 3 — Bottom Navigation Guidelines
- Apple Human Interface Guidelines — Tab Bars
- Nielsen Norman Group — Navigation Design Best Practices
- SWR (Stale-While-Revalidate) — Vercel/Next.js 공식 데이터 페칭 라이브러리

---

> 이 문서는 "기능을 줄이자"가 아니라 **"같은 기능을 더 빠르고, 더 저렴하고, 더 깔끔하게 제공하자"**는 제안입니다.
> Phase 1은 기존 코드 구조를 크게 변경하지 않으면서 즉시 효과를 볼 수 있습니다.
> 논의가 필요한 부분(관심종목 이동, 모바일 탭 축소)은 Phase 2~3으로 분리했습니다.

# Alpha Desk 네비게이션 메뉴 개수 분석

> 작성일: 2026-04-15 | 현재 메뉴 8개에 대한 UX 분석 및 개선 방향

---

## 현재 메뉴 구조 (8개)

| # | 메뉴 | 경로 | 기능 |
|---|------|------|------|
| 1 | HOME | `/` | 메인 화면 |
| 2 | DASHBOARD | `/dashboard` | 시장 분석 대시보드 |
| 3 | WATCHLIST | `/watchlist` | 관심종목 관리 |
| 4 | BOARD | `/board` | 게시판 |
| 5 | NEWS | `/news` | 뉴스 검색 |
| 6 | STOCK_PICKS | `/stock-recommendation` | AI 종목 추천 |
| 7 | INVEST | `/invest` | AI 투자 판단 |
| 8 | VIDEOS | `/youtube` | 유튜브 영상 |

**노출 위치:**
- 데스크톱: 상단바(TopBar) 8개 + 사이드바(SideBar) 8개
- 모바일: 하단 네비게이션(MobileNavBar) 8개

---

## 1. 이론적 근거

### Miller's Law (7±2 법칙)
- George A. Miller (1956, Psychological Review) — 단기 기억 용량 7±2개
- **다만** 네비게이션은 화면에 항상 보이므로 "기억"이 아닌 **스캔 용이성**이 핵심
- Nelson Cowan (2001) 후속 연구 — 실제 작업 기억 용량은 **4±1개**로 수정
- **데스크톱 8개**: Miller's Law 범위 내 (5~9개)
- **모바일 8개**: Cowan 기준 초과 (3~5개 권장)

### Hick's Law (힉의 법칙)
- 선택지가 많을수록 의사결정 시간이 로그적으로 증가: `T = b × log₂(n+1)`
- 메뉴 8개 vs 4개: 약 **1.5배**의 의사결정 시간 차이
- 금융 앱에서 빠른 탐색이 중요한 만큼 메뉴 수 최소화가 유리

### 인지 부하 (Cognitive Load)
- **선택 마비 (Choice Paralysis)**: 선택지 과다 시 오히려 만족도 저하 (Schwartz, 2004)
- **시각적 혼잡**: 스캔 시간 증가, 핵심 기능 발견성(discoverability) 저하
- **오류율 증가**: 잘못된 메뉴 선택 빈도 증가

---

## 2. 플랫폼별 가이드라인

### 모바일 하단 네비게이션

| 가이드라인 | 권장 개수 | 비고 |
|-----------|----------|------|
| **Material Design 3** (Google) | 3~5개 | 5개 초과 시 터치 타겟 너무 작아짐 |
| **Apple HIG** (iOS Tab Bar) | 최대 5개 | 초과 시 자동 "More" 탭 생성 |
| **실무 합의** | **4개 최적** | 3개는 단순, 5개는 허용 한계 |

> **Alpha Desk 모바일 8개 → Material Design/Apple HIG 기준 초과**

### 데스크톱 사이드바

- 공간 여유가 있어 **6~10개** 일반적
- 8개는 허용 범위이나 **상한선에 가까움**
- 스크롤 없이 한 화면에 보이는 것이 핵심 (NNGroup)

> **Alpha Desk 데스크톱 8개 → 허용 범위 내, 그룹핑 권장**

---

## 3. 금융/투자 앱 벤치마크

### 모바일

| 앱 | 하단 탭 수 | 메뉴 구성 | 전략 |
|----|-----------|----------|------|
| **토스증권** | 4개 | 홈, 관심, 내주식, 메뉴 | 극도로 미니멀, "메뉴" 탭에서 전체 기능 접근 |
| **카카오페이증권** | 5개 | 홈, 주식, 투자, 자산, 더보기 | 핵심만 노출 |
| **나무증권 (NH)** | 5개 | + 햄버거 메뉴 내 다수 | 전통 증권사, 복잡 |
| **Robinhood** | 4개 | Feed, Search, Portfolio, Account | 극단적 단순화 |
| **Yahoo Finance** | 5개 | 뉴스 중심, 관심종목/포트폴리오 | 정보 밀도 높음 |

> **업계 표준: 모바일 하단 탭 4~5개**

### 데스크톱

| 앱 | 사이드바 수 | 특징 |
|----|-----------|------|
| **Webull** | 8~10개 | 트레이딩 중심, 기능 밀도 높음 |
| **TradingView** | 10개+ | 도구 패널 형태, 파워유저 대상 |
| **Notion** | 5~6개 | + 사용자 페이지 별도 |
| **Jira** | 7~9개 | 그룹핑으로 관리 |

> **데스크톱 전문 도구는 8~10개가 흔하나, 그룹핑/축소 모드 필수**

---

## 4. Alpha Desk 진단

### 데스크톱 (사이드바 + 상단바)
- 8개 → **허용 범위** (금융 데스크톱 앱 기준 적절)
- 아이콘 + 텍스트 병행 → 좋음
- **개선 필요**: 그룹핑 없이 8개가 나열되어 있음

### 모바일 (하단 네비게이션)
- 8개 → **과다** (Material Design/Apple HIG 기준 초과)
- 터미널 스타일 9px 폰트 → 360px 이하 기기에서 가독성 문제
- **개선 필요**: 핵심 4~5개만 노출, 나머지는 "더보기"로 이동

---

## 5. 개선 방안

### 방안 A: 모바일만 축소 (권장, 최소 변경)

**모바일 하단 탭 5개:**

| 탭 | 기능 |
|----|------|
| HOME | 메인 화면 |
| MARKET | DASHBOARD + NEWS + VIDEOS 통합 진입점 |
| INVEST | AI 투자 판단 (핵심 기능) |
| WATCHLIST | 관심종목 |
| MORE | BOARD, STOCK_PICKS, 설정 등 |

**데스크톱**: 현재 8개 유지 + 그룹핑 적용

### 방안 B: 전체 메뉴 구조 재편

**데스크톱 사이드바 (2그룹):**
```
── 시장 분석 ──
  DASHBOARD
  NEWS
  VIDEOS

── 투자 도구 ──
  INVEST
  WATCHLIST
  STOCK_PICKS

── 커뮤니티 ──
  BOARD
```

**모바일 하단 탭 4개:**
```
HOME | INVEST | WATCHLIST | MORE
```

### 방안 C: 현행 유지 + 사이드바 그룹핑만 적용

가장 보수적 접근. 데스크톱에 구분선만 추가:
```
HOME
─────────────
DASHBOARD
WATCHLIST
─────────────
NEWS
STOCK_PICKS
INVEST
VIDEOS
─────────────
BOARD
```

---

## 6. 결론

| 환경 | 현재 | 판정 | 권장 |
|------|------|------|------|
| **데스크톱** | 8개 | 허용 범위 | 그룹핑 추가하면 충분 |
| **모바일** | 8개 | **과다** | 4~5개로 축소 권장 |

**우선순위**: 모바일 하단 탭 축소 > 데스크톱 그룹핑 > 전체 구조 재편

---

## 참고 자료

- Miller, G.A. (1956). "The Magical Number Seven, Plus or Minus Two." Psychological Review, 63(2), 81-97
- Cowan, N. (2001). "The magical number 4 in short-term memory." Behavioral and Brain Sciences, 24(1)
- Hick, W.E. (1952). "On the rate of gain of information." Quarterly Journal of Experimental Psychology
- Schwartz, B. (2004). The Paradox of Choice. HarperCollins
- Google Material Design 3 — Bottom Navigation Guidelines
- Apple Human Interface Guidelines — Tab Bars
- Nielsen Norman Group — Navigation Design Best Practices

# FE-07, FE-08 백엔드 연동 구현 결과 (2026-03-21)

> Watchlist 및 Dashboard 페이지 백엔드 API 연동 완료.

---

## FE-07: Watchlist 백엔드 연동

### 변경 전 / 후

| 항목 | 변경 전 | 변경 후 |
|------|---------|---------|
| 데이터 저장 | `useState` 로컬 상태 | 백엔드 API + 로컬 상태 동기화 |
| 페이지 진입 | 빈 목록 | `GET /watchlist` 자동 로드 |
| 종목 추가 | 로컬 ID 생성 | `POST /watchlist` 후 응답값 반영 |
| 종목 삭제 | 로컬 필터 | `DELETE /watchlist/{id}` 후 로컬 제거 |
| 입력 필드 | symbol 1개 | symbol + name 2개 (백엔드 필수값) |

### 생성 파일

```
features/watchlist/
  domain/model/watchlistItem.ts         ← WatchlistItem 타입 정의
  infrastructure/api/watchlistApi.ts    ← fetchWatchlist, addWatchlistItem, deleteWatchlistItem
  application/hooks/useWatchlist.ts     ← load, add, remove + 상태 관리
```

### API 스펙

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/watchlist` | 전체 목록 조회 |
| POST | `/watchlist` | 종목 추가 (`symbol`: 6자리 숫자, `name`: 필수) |
| DELETE | `/watchlist/{id}` | 종목 삭제 (204 No Content) |

### 에러 처리

- 목록 로드 실패 → "목록을 불러오지 못했습니다."
- 409 Conflict (중복 종목) → "이미 등록된 종목입니다."
- 기타 등록/삭제 실패 → 각 에러 메시지 표시

---

## FE-08: Dashboard 백엔드 연동

### 변경 전 / 후

| 항목 | 변경 전 | 변경 후 |
|------|---------|---------|
| 데이터 소스 | `MOCK_STOCKS` 하드코딩 배열 | `GET /pipeline/summaries` API |
| 빈 상태 처리 | 없음 | "Pipeline을 먼저 실행해 주세요." 안내 |
| 로딩 상태 | 없음 | "불러오는 중..." 표시 |
| 에러 처리 | 없음 | 에러 메시지 표시 |

### 생성 파일

```
features/dashboard/
  domain/model/stockSummary.ts          ← StockSummary 타입 정의
  infrastructure/api/dashboardApi.ts    ← fetchDashboardSummaries
  application/hooks/useDashboard.ts     ← 로딩/에러/데이터 상태 관리
```

### API 스펙

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/pipeline/summaries` | AI 분석 완료된 종목 요약 목록 |

### Response 필드

```typescript
{
  symbol: string         // 종목 코드
  name: string          // 종목명
  summary: string       // AI 생성 요약
  tags: string[]        // 태그 목록
  sentiment: string     // positive / negative / neutral
  sentiment_score: number
  confidence: number
}
```

> `sentiment_score`, `confidence`는 현재 `StockSummaryCard`에 미표시.
> 카드 UI 확장 시 활용 가능.

---

## 공통 변경 사항

### httpClient DELETE 메서드 추가

**파일**: `infrastructure/http/httpClient.ts`

```typescript
delete: async (path: string) => {
    const res = await fetch(`${env.apiBaseUrl}${path}`, {
        method: "DELETE",
        credentials: "include",
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res
},
```

---

---

## 백엔드 요청 사항

### [요청] Watchlist symbol 검증 완화

#### 배경

현재 백엔드의 `POST /watchlist` 엔드포인트는 `symbol` 필드에 아래 정규식 검증을 적용한다.

```python
symbol: str  # 정규식: ^\d{6}$
```

이 제약으로 인해 프론트에서 **종목명만 입력해도 등록**되도록 구현하는 것이 불가능하다.
6자리 숫자 코드가 아닌 값(예: `삼성전자`, `AAPL`)을 입력하면 백엔드가 422를 반환한다.

#### 요청 내용

`symbol` 필드의 검증을 다음과 같이 완화해 달라.

```python
# 현재 (한국 주식 코드 전용)
symbol: str = Field(..., pattern=r"^\d{6}$")

# 요청 (자유 형식 허용)
symbol: str = Field(..., min_length=1, max_length=20)
```

#### 기대 효과

| 입력 예시 | 현재 | 변경 후 |
|-----------|------|---------|
| `005930` | ✅ 등록 | ✅ 등록 |
| `삼성전자` | ❌ 422 | ✅ 등록 |
| `AAPL` | ❌ 422 | ✅ 등록 |

#### 현재 프론트 처리

symbol 검증 실패 시 사용자에게 아래 메시지를 표시하고 있으며,
백엔드 수정 완료 후 해당 메시지 및 클라이언트 검증 로직을 제거할 예정이다.

```
"종목 코드(6자리 숫자)를 입력하거나 정확한 종목명을 입력해 주세요. 예: 005930"
```

---

## 아키텍처 레이어 구조

```
app/watchlist/page.tsx         → useWatchlist (Application)
app/dashboard/page.tsx         → useDashboard (Application)
                                      ↓
features/*/application/hooks/  → 상태 관리, 에러 처리
                                      ↓
features/*/infrastructure/api/ → httpClient 호출
                                      ↓
infrastructure/http/httpClient → fetch + credentials: include
```

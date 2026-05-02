# BL-FE-39

**Backlog Type**
Feature

**Backlog Title**
감성 예측 ↔ 실제 등락 정합 뱃지 — 히트맵 헤더에 AI 예측 일치 여부 표시

---

## 1. 배경

`StockSummaryCard`에 감성점수(sentiment_score)와 일별등락 히트맵이 함께 표시되지만,
둘 사이의 관계를 사용자가 직접 해석해야 한다.
"AI가 긍정이라 예측했는데, 실제 주가는 어떻게 됐나?"를 한눈에 보여주는 인디케이터가 없다.

연구 문서: `docs/RESEARCH-sentiment-heatmap-correlation-ui.md` (🅐안 채택)

## 2. 구현 내용

### 2-1. `StockDailyReturnsHeatmap` — prop 추가 + 뱃지 렌더

`sentimentScore?: number` prop을 추가하고, 히트맵 헤더 우측에 정합 뱃지를 렌더한다.

**계산 로직:**
```
sentimentDir =
  sentimentScore > +0.1  → 'UP'
  sentimentScore < -0.1  → 'DOWN'
  else                   → 'NEUTRAL'

total = summary.up + summary.down
priceRatio = total > 0 ? summary.up / total : 0.5
priceDir =
  priceRatio > 0.55  → 'UP'
  priceRatio < 0.45  → 'DOWN'
  else               → 'NEUTRAL'

matchResult =
  sentimentDir === 'NEUTRAL' || priceDir === 'NEUTRAL'  → 'UNCLEAR'
  sentimentDir === priceDir                              → 'MATCH'
  else                                                   → 'MISMATCH'
```

**뱃지 렌더 (UNCLEAR면 표시 안 함):**
- MATCH   → `"AI{방향} · 실제{방향} ✓"` 초록
- MISMATCH → `"AI{방향} · 실제{방향} ✗"` 빨강

방향 표시: UP → `↑`, DOWN → `↓`

### 2-2. `StockSummaryCard` — sentiment_score 전달

기존 `heatmap` prop 전달 시 `sentiment_score`도 함께 넘긴다.

## 3. Success Criteria

| ID | 기준 |
|----|------|
| SC-1 | 감성 POSITIVE + 상승 우위 → 초록 뱃지 `"AI↑ · 실제↑ ✓"` 표시 |
| SC-2 | 감성 NEGATIVE + 하락 우위 → 초록 뱃지 `"AI↓ · 실제↓ ✓"` 표시 |
| SC-3 | 감성 POSITIVE + 하락 우위 → 빨강 뱃지 `"AI↑ · 실제↓ ✗"` 표시 |
| SC-4 | 감성 NEUTRAL(score ±0.1 이내) → 뱃지 미표시 |
| SC-5 | sentimentScore prop 없으면 뱃지 미표시 |
| SC-6 | `tsc` 통과 |

## 4. 변경 파일

| 파일 | 변경 |
|---|---|
| `app/components/StockDailyReturnsHeatmap.tsx` | `sentimentScore` prop + 뱃지 렌더 |
| `app/components/StockSummaryCard.tsx` | `sentiment_score`를 heatmap으로 전달 |

## 5. 완료 정의

- [ ] SC-1 ~ SC-6 통과
- [ ] `tsc` 통과

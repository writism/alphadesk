# BL-FE-32

**Backlog Type**  
UX / Responsive

**Backlog Title**  
관심종목 행 — 좁은 화면에서 일별 등락 히트맵 접기(`<details>`)

---

## 1. 배경

- BL-FE-30 §10에서 관심종목 행이 심볼·뱃지·히트맵·삭제로 **모바일에서 밀도가 높다**고 남겼다.

## 2. 목표

| ID | 기준 |
|----|------|
| SC-1 | `sm` 미만에서는 히트맵을 **기본 접힌** 블록으로 두고, 제목 클릭으로 펼친다. |
| SC-2 | `sm` 이상에서는 **기존과 같이** 항상 펼쳐진 히트맵을 본다. |
| SC-3 | 대시보드 `StockSummaryCard` 동작은 **변경하지 않는다**. |

## 3. 구현

- `WatchlistHeatmapCollapsible` 래퍼: `hidden sm:block` + `sm:hidden` `<details>` 이중 패턴(두 인스턴스 마운트 허용).

## 4. 관련 백로그

- **BL-FE-30**, **BL-FE-31**

## 5. 완료 정의

- [x] 관심종목 페이지에 래퍼 적용.
- [x] `tsc` 통과.

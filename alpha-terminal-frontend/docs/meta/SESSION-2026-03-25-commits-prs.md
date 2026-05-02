# 세션 기록: 2026-03-25 — 백로그·히트맵·페이지네이션 PR 묶음

## PR 링크

| 저장소 | 포크 PR (writism) | 업스트림 PR (EDDI, 팀 머지) | 브랜치 |
|--------|-------------------|-----------------------------|--------|
| **alpha-desk-frontend** | [#3](https://github.com/writism/alpha-desk-frontend/pull/3) | [#19](https://github.com/EDDI-RobotAcademy/alpha-desk-frontend/pull/19) | `feat/bl-fe-30-37-heatmap-pagination-proxy` |
| **alpha-desk-ai-server** | [#6](https://github.com/writism/alpha-desk-ai-server/pull/6) | [#28](https://github.com/EDDI-RobotAcademy/alpha-desk-ai-server/pull/28) | `feat/bl-be-04-17-backlog-heatmap-pipeline` |

> `gh pr create` 시 `Head ref` 오류가 나면 `--head writism:<브랜치명>` 형식으로 지정.  
> 업스트림: `gh pr create --repo EDDI-RobotAcademy/<repo> --base main --head writism:<브랜치>`

---

## 프론트엔드 (`alpha-desk-frontend`)

### 커밋 (3개)

1. **`docs(front): backlog BL-FE-30 through BL-FE-37`**  
   - `docs/backlog/BL-FE-30` ~ `BL-FE-37` (8파일)

2. **`feat(front): heatmap UI, pagination, Storybook, API rewrites`**  
   - 히트맵 훅·타입·API, `StockDailyReturnsHeatmap`, 범례, 관심종목 접기  
   - 대시보드 요약/로그/관심종목 그리드, `/watchlist` 페이지네이션  
   - `useClientPagination`, `ClientPaginationBar`  
   - Storybook (`@storybook/react-vite`), `next.config` rewrites

3. **`docs(meta): session record for 2026-03-25 PR bundle`**  
   - 본 문서 (`docs/meta/SESSION-2026-03-25-commits-prs.md`)

### 커밋에서 제외

- `frontend.pid`

---

## 백엔드 (`alpha-desk-ai-server`)

### 커밋 (4개)

1. **`docs(back): backlog BL-BE-04 through BL-BE-17`**  
   - `docs/backlog/` 12파일 (BL-BE-04~09, BL-BE-13~17)

2. **`feat(stock): daily returns heatmap API and market data adapters`**  
   - `data.go.kr` / Twelve Data 어댑터, 히트맵 use case, Redis 캐시  
   - `get_settings` lru 제거, `stock_router`, `.env.example` 키

3. **`feat: pipeline analysis logs, per-user watchlist, auth flow`**  
   - 파이프라인 분석 로그 ORM·리포지토리  
   - 관심종목 per-user, account/kakao/auth, 뉴스 수집기 등

4. **`docs(meta): session record for 2026-03-25 PR bundle`**  
   - `docs/meta/SESSION-2026-03-25-commits-prs.md` (요약본)

### 커밋에서 제외

- `server.pid`, `PROJECT_ANALYSIS.md`  
- `docs/backlog/BL-BE-18-mobile-oauth-env-config.md` (미스테이징)

---

## 백로그 파일 수 (이번 PR에 포함)

- 프론트: **8** (BL-FE-30 ~ 37)  
- 서버: **12** (BL-BE-04~09, 13~17)  
- **합계 20** (BL-BE-06은 파일 2개·번호 중복 1)

---

## 머지 후 권장

- 로컬 `main` 갱신 후 `feat/bl-fe-29-dashboard-pipeline` 등 예전 브랜치 정리  
- `.env`에 `DATA_GO_KR_SERVICE_KEY`, `TWELVE_DATA_API_KEY`, `HEATMAP_REDIS_CACHE_ENABLED` 확인

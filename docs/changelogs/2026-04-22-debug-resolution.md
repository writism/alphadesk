# 디버깅 리스트 v1 — 이승욱 할당 7건 처리 결과

> 작성일: 2026-04-22  
> 담당자: 이승욱  
> 처리 기간: 2026-04-16 ~ 2026-04-22

---

## 요약

| # | 항목 | 영역 | BL | 처리일 | 상태 |
|---|------|------|----|--------|------|
| 1 | INVEST 종목 분석 시 결과 재사용 안됨 | BE+FE / 분석 연동 | BL-BE-75/76 | 2026-04-18 | ✅ 완료 |
| 2 | 뉴스·공시 여러 건 수집해도 분석 결과 1건만 출력 | BE / AI 분석기 | BL-BE-76 | 2026-04-18 | ✅ 완료 |
| 3 | AI 분석 시 사용자 프로필이 Mock 데이터로 응답 | BE | BL-BE-79 | 2026-04-21 | ✅ 완료 |
| 4 | 사용자 프로필 속성 없을 때 AI 분석 500 오류 | BE | BL-BE-81 | 2026-04-21 | ✅ 완료 |
| 5 | 종목 테마 JSON 파싱 실패 시 서버 오류 | BE | BL-BE-82 | 2026-04-21 | ✅ 완료 |
| 6 | 대시보드 API 1개 실패 시 전체 화면 오류 | FE | BL-FE-76 | 2026-04-21 | ✅ 완료 |
| 7 | 뉴스 목록 필터 변경 시 목록 갱신 안됨 | FE | BL-FE-77 | 2026-04-21 | ✅ 완료 |

---

## 상세 처리 내용

### 1. INVEST 종목 분석 시 결과 재사용 안됨 (BL-BE-75/76)

**문제**  
INVEST 페이지에서 종목 분석 시 대시보드에서 이미 분석한 결과를 재사용하지 않고 처음부터 재실행됨. 불필요한 OpenAI API 호출 + 사용자 대기 시간 증가.

**원인**
- 스트림 엔드포인트(`/investment/decision/stream`)에 캐시 로직 없음
- INVEST 에이전트의 Retrieval 노드가 대시보드 분석 결과(`analysis_logs`)를 참조하지 않음

**수정 내용**
- `InvestmentDecisionRequest.symbol`: `Optional[str] = None`으로 변경 (422 방지)
- `/investment/decision/stream`: 캐시 미스 시 전체 워크플로우 실행 → 완료 후 `analysis_cache`에 TTL 1h 저장
- Retrieval 노드에 `"대시보드 분석"` 소스 추가 → `analysis_logs`에서 기존 분석 결과 우선 참조

**변경 파일**
- `app/domains/investment/application/request/investment_decision_request.py`
- `app/domains/investment/adapter/inbound/api/investment_router.py`
- `app/domains/investment/adapter/outbound/agent/retrieval_node.py`

---

### 2. 뉴스·공시 여러 건 수집해도 분석 결과 1건만 출력됨 (BL-BE-76)

**문제**  
파이프라인 실행 시 뉴스·공시를 여러 건 수집하더라도 분석 결과가 1건만 출력됨.

**원인**  
`stock_analyzer` 입력 개수 확인 결과, 분석 파이프라인에 첫 번째 항목만 전달되는 로직 오류.

**수정 내용**
- 수집된 전체 기사를 분석 파이프라인에 전달하도록 수정
- `article_mode` 파라미터(`latest_3` / `latest_5` / `best_3` / `best_5_24h`) 도입으로 수집 건수 제어
- 파이프라인 실행 로그에 종목별 기사 선택 건수 기록 (BL-BE-77 병행)

---

### 3. AI 분석 시 사용자 프로필이 Mock 데이터로 응답됨 (BL-BE-79)

**문제**  
`market_analysis_router`가 `MockUserProfileRepository`를 사용 중이어서 account_id 1~3 외 모든 사용자에게 비개인화 분석 응답.

**원인**  
개발 초기에 Mock으로 연결한 코드가 실DB 교체 없이 그대로 운영에 반영됨.

**수정 내용**
```python
# Before
user_profile_repo = MockUserProfileRepository()

# After
user_profile_repo = UserProfileRepositoryImpl(db)
```
- `UserProfileRepositoryImpl`에 `get_by_account_id()` 브릿지 메서드 추가 (포트 시그니처 불일치 해소)

**변경 파일**
- `app/domains/market_analysis/adapter/inbound/api/market_analysis_router.py`
- `app/domains/user_profile/adapter/outbound/persistence/user_profile_repository_impl.py`

---

### 4. 사용자 프로필 속성 없을 때 AI 분석 500 오류 (BL-BE-81)

**문제**  
`UserProfile` 엔티티에 `investment_style` 등 신규 필드가 없는 경우 `ContextBuilderService.build()`에서 `AttributeError` 발생 → 500 응답.

**원인**  
직접 속성 접근(`user_profile.investment_style`)이 필드 미존재 시 예외를 발생시킴.

**수정 내용**
```python
# Before (AttributeError 위험)
if user_profile.investment_style:
    profile_lines.append(f"- 투자 스타일: {user_profile.investment_style}")

# After (안전 접근)
if getattr(user_profile, 'investment_style', ''):
    profile_lines.append(f"- 투자 스타일: {user_profile.investment_style}")
```
- 7개 필드 전체 `getattr(obj, attr, default)` 방식으로 변경

**변경 파일**
- `app/domains/market_analysis/domain/service/context_builder_service.py`

---

### 5. 종목 테마 JSON 파싱 실패 시 서버 오류 (BL-BE-82)

**문제**  
`market_data_repository_impl`에서 `themes` 컬럼의 `json.loads()` 호출 시 예외 처리 없어 파싱 실패 → 500 오류 가능성.

**원인**  
DB에 잘못된 형식의 JSON 문자열 또는 `NULL` 값이 저장된 경우 예외 미처리.

**수정 내용**
```python
# Before
themes = json.loads(o.themes or "[]")

# After
try:
    themes = json.loads(o.themes or "[]")
except (json.JSONDecodeError, TypeError):
    logger.warning("[MarketData] %s 테마 JSON 파싱 실패 — 빈 목록으로 대체 (raw=%r)", o.code, o.themes)
    themes = []
```

**변경 파일**
- `app/domains/market_analysis/adapter/outbound/persistence/market_data_repository_impl.py`

---

### 6. 대시보드 API 1개 실패 시 전체 화면 오류 처리됨 (BL-FE-76)

**문제**  
대시보드에서 3개 API(`summaries`, `report-summaries`, `logs`) 중 1개라도 실패하면 `Promise.all`이 전체를 reject → 빈 화면.

**원인**  
`Promise.all`은 하나가 실패하면 전체 실패로 처리함.

**수정 내용**
```typescript
// Before
const [summaryRes, reportRes, logRes] = await Promise.all([...])

// After
const [summaryResult, reportResult, logResult] = await Promise.allSettled([...])
// 401 → 전체 throw
// 전부 실패 → throw
// 일부 실패 → 성공한 데이터만 반환
```

**변경 파일**
- `features/dashboard/application/hooks/useDashboard.ts`

---

### 7. 뉴스 목록 필터 변경 시 목록 갱신 안됨 (BL-FE-77)

**문제**  
뉴스 목록에서 시장 필터 변경 시 목록이 갱신되지 않는 경우 발생.

**원인**  
`useEffect` 의존성 배열에 `fetchPage`, `setState`가 누락되어 stale closure 발생. `eslint-disable-next-line react-hooks/exhaustive-deps`로 린트 경고 억제 중이었음.

**수정 내용**
- `fetchPage`를 `useCallback`으로 메모이제이션
- `useEffect` 의존성 배열: `[isLoggedIn, marketFilter]` → `[isLoggedIn, marketFilter, fetchPage, setState]`
- `eslint-disable` 주석 제거
- `changeMarket` 콜백 deps: `[]` → `[setMarketFilter]`

**변경 파일**
- `features/news/application/hooks/useNewsList.ts`

---

## 관련 PR (upstream)

| PR | 링크 | 상태 |
|----|------|------|
| BE #17 refactor(be): perf·types 리팩토링 (BL-BE-75/76/77/83~87) | EDDI-RobotAcademy/alpha-terminal-ai-server#17 | MERGED |
| BE #18 feat(be): UserProfile 실DB + ORM + ContextBuilder (BL-BE-79/80/81) | EDDI-RobotAcademy/alpha-terminal-ai-server#18 | MERGED |
| BE #19 fix(be): StockTheme JSON 파싱 (BL-BE-82) | EDDI-RobotAcademy/alpha-terminal-ai-server#19 | MERGED |
| FE #20 fix(fe): useDashboard Promise.allSettled (BL-FE-76) | EDDI-RobotAcademy/alpha-terminal-frontend#20 | MERGED |
| FE #21 fix(fe): useNewsList deps 수정 (BL-FE-77) | EDDI-RobotAcademy/alpha-terminal-frontend#21 | MERGED |

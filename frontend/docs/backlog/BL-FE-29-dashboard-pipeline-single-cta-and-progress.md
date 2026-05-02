# BL-FE-29

**Backlog Type**  
UX / Integration Backlog

**Backlog Title**  
대시보드 파이프라인 CTA 단일화, AI 분석 요약 영역에 진행 상태·결과 집중 표시

---

## 1. 배경 / 문제

### 1.1 중복 CTA
현재 대시보드에 “선택 종목 분석”에 해당하는 진입점이 **둘 이상** 존재한다.

| 위치 | 파일·구성요소 | 동작 |
|------|----------------|------|
| 상단 헤더 | `app/dashboard/page.tsx` — 우측 파란 버튼 | `handleRunPipeline` 호출 |
| AI 분석 요약 빈 상태 | `app/dashboard/components/DashboardSummarySection.tsx` | 동일 `onRunPipeline` |
| (선택) 최근 로그 빈 상태 | `app/dashboard/components/DashboardAnalysisLogsSection.tsx` | 동일 패턴 가능 |

사용자는 **한 곳**에서만 “분석 시작”을 기대하는 것이 자연스럽다.

### 1.2 진행 피드백
상단 배너(`running` 시 파란 안내)만으로는 Serp / Finnhub / 네이버 / AI 단계를 구분하기 어렵다.  
**실제 단계 문구**는 백엔드 스트리밍(**BL-BE-12**) 없이는 정확히 맞추기 어렵다. 본 백로그는 **UI 구조 + 계약 + 폴백**까지 정의한다.

---

## 2. 목표 (Success Criteria)

| ID | 기준 |
|----|------|
| SC-1 | 화면에 **하나의 주요 “선택 종목 분석” 버튼**만 남긴다(헤더 우측). 요약/로그 빈 상태의 **중복 파란 버튼은 제거**한다. |
| SC-2 | 빈 상태에서는 텍스트 안내 + 필요 시 **텍스트 링크**(`관심종목 등록하기` 등)만 허용한다. |
| SC-3 | **“AI 분석 요약”** 섹션은 (로딩/빈/결과/진행) 네 가지 모드를 명확히 가진다. |
| SC-4 | **BL-BE-12** 구현 후: 스트림 이벤트를 받아 요약 카드 영역 상단 또는 내부에 **진행 로그(스크롤 가능 리스트)** 를 표시한다. |
| SC-5 | 스트림 **완료(`done`)** 후: 기존처럼 `StockSummaryCard` 그리드로 전환하고, `useDashboard.reload()`로 `GET /pipeline/summaries`, `GET /pipeline/logs`를 갱신한다. |
| SC-6 | 백엔드 스트리밍 **미도입 기간** 폴백: 기존 `POST /pipeline/run` + 상단 배너 + 짧은 단계 문구(선택)만 표시하되, **거짓 특정 소스명**은 쓰지 않는다. |
| SC-7 | 접근성: 진행 영역에 `role="status"`, `aria-live="polite"`, 스트림 중 요약 그리드는 `aria-busy` 등 기존 패턴과 일관 |

---

## 3. 화면 정보 구조 (목표 UX)

```
[헤더] 제목 ………………… [선택 종목 분석 (N개)]  ← 유일한 주 버튼

[파이프라인 실행 결과] (기존, 완료 후만)

[관심종목] (체크박스, running 시 disabled 유지)

[AI 분석 요약]
  - idle + summaries 있음: 카드 그리드
  - idle + summaries 없음: 점선 박스 + “아직 분석된 종목이 없습니다.” + (관심종목 0이면 링크만)
  - loading(초기 fetch): 스켈레톤
  - running + 스트림: 진행 로그 패널(타임스탬프 + 메시지) + 완료 시 카드로 전환
```

**최근 AI 분석 로그** 섹션: 기존처럼 하단 유지. 완료 후 `reload`로 최신 로그 반영.

---

## 4. 프론트 구현 작업 분해

### 4.1 컴포넌트
- `DashboardSummarySection.tsx`  
  - `onRunPipeline` prop **제거**(또는 optional로 두고 페이지에서 미전달)  
  - 빈 상태에서 **버튼 제거**, 카피만 조정  
- `DashboardAnalysisLogsSection.tsx`  
  - 빈 상태의 “선택 종목 분석” 버튼 제거 → “상단 버튼으로 분석을 실행하세요” 등 안내 문구  
- (신규) `DashboardPipelineProgressPanel.tsx` (이름 가칭)  
  - `events: ProgressEvent[]` 표시, 최대 높이 + 스크롤  
- `app/dashboard/page.tsx`  
  - 스트림 시작/종료 상태, 이벤트 배열 state  
  - BL-BE-12 연동 시 `fetch` stream reader 또는 `EventSource` 래퍼

### 4.2 데이터 / API 레이어
- `features/dashboard/infrastructure/api/dashboardApi.ts`  
  - `runPipelineStream(symbols?: string[], onLine: (obj: unknown) => void): Promise<void>` 등 추가  
  - `credentials: "include"` 유지, `ApiError`와 스트림 중 HTTP 에러 처리 분리  
- `features/dashboard/domain/model/`  
  - `PipelineProgressEvent` 타입 정의 (백엔드 스키마와 동일하게)

### 4.3 훅
- `useDashboard.ts`  
  - `executePipeline`:  
    - 플래그 또는 별도 메서드 `executePipelineWithProgress`  
    - 스트림 종료 후 기존 `load()` 호출  
  - 진행 이벤트 state를 훅에서 관리할지, 페이지에서 관리할지 결정 (권장: 훅에서 `progressEvents`, `clearProgress`)

---

## 5. 백엔드 의존성 (BL-BE-12)

| 항목 | 설명 |
|------|------|
| 엔드포인트 URL | 합의된 경로 (예: `POST /pipeline/run-stream`) |
| 미디어 타입 | `application/x-ndjson` 또는 SSE |
| 이벤트 스키마 | `BL-BE-12` 문서의 JSON 필드와 **동일 키** 사용 |
| 종료 | `type: "done"` 수신 후 `load()` 트리거 |
| 실패 | `type: "error"` 또는 HTTP 비정상 → 토스트/배너 + `reload` 선택 |

**BL-BE-12 미구현 시:**  
- `executePipeline`은 현재처럼 `POST /pipeline/run`만 호출  
- `DashboardPipelineProgressPanel`은 렌더하지 않거나 단일 줄 “분석 중…” 만 표시

---

## 6. 회귀 / 비기능

- 기존 `선택 종목 분석` 비활성 조건(`running`, `isSummaryLoading`, 선택 0개)은 **헤더 버튼**에 그대로 적용  
- 파이프라인 결과 테이블(`DashboardPipelineResult`) 동작 유지  
- 모바일 네비에서 헤더 버튼이 과밀하면 **반응형**으로 제목 줄바꿈 또는 아이콘 버튼 검토 (별도 서브태스크 가능)

---

## 7. Todo (체크리스트)

1. [ ] `DashboardSummarySection` / `DashboardAnalysisLogsSection`에서 중복 버튼 제거 및 카피 수정  
2. [ ] `PipelineProgressEvent` 타입 및 `dashboardApi` 스트림 헬퍼 스텁 추가 (BL-BE-12 전까지 no-op 또는 플래그)  
3. [ ] BL-BE-12 완료 후 스트림 파싱 연결 + 진행 패널 UI  
4. [ ] 완료 시 `summaries` / `logs` 갱신 및 스크롤 위치(요약으로 포커스 이동 여부) UX 결정  
5. [ ] `aria-live` / `aria-busy` 점검

---

## 8. 관련 백로그

- **BL-FE-21**: 요약을 로그보다 위 — 본 작업 후에도 순서 유지  
- **BL-FE-24**: 실행 중 체크박스 비활성 등 — 유지  
- **BL-BE-12**: 스트리밍 API — 본 FE 작업의 전제(진행 문구 정확도)

---

## 9. 완료 정의 (Definition of Done)

- [ ] 코드 리뷰 시 “분석 시작” 버튼이 헤더에만 있는 것이 한눈에 드러남  
- [ ] BL-BE-12 연동 후 로컬에서 다중 소스 수집 시 UI에 단계 문구가 순차 표시됨  
- [ ] `tsc` / 린트 통과

# BL-FE-67

**Backlog Type**
Behavior Backlog

**Backlog Title**
인증된 사용자가 대시보드를 재방문하면 10분 이내 분석 데이터가 캐시에서 즉시 반환된다

**배경**
useDashboard의 summaries/reportSummaries/analysisLogs 로딩을 SWR로 전환한다.
파이프라인 실행(executePipeline)은 SWR mutate로 캐시를 무효화한다.

**Success Criteria**
- 대시보드 마운트 시 10분 이내 재방문이면 API를 재호출하지 않는다
- 파이프라인 실행 완료 후 캐시가 무효화되어 최신 데이터로 갱신된다
- 로딩/에러 상태가 기존과 동일하게 동작한다

**Todo**
1. summaries/reportSummaries/analysisLogs 조회를 useSWR로 전환한다 (TTL 10분)
2. executePipeline 완료 후 mutate로 캐시를 무효화한다
3. reload 함수를 mutate 기반으로 교체한다

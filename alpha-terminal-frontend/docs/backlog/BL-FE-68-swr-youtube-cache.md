# BL-FE-68

**Backlog Type**
Behavior Backlog

**Backlog Title**
인증된 사용자가 유튜브 영상 목록을 재방문하면 30분 이내 캐시된 목록이 즉시 반환된다

**배경**
useYoutubeList의 API 호출을 SWR로 전환하여 YouTube API 할당량 소진을 방지한다.

**Success Criteria**
- 30분 이내 재방문 시 YouTube API를 재호출하지 않는다
- 종목명(stockName) 변경 시 캐시 키가 바뀌어 새 데이터를 가져온다
- 페이지 이동(nextPageToken/prevPageToken)이 정상 동작한다
- 로딩/에러 상태가 기존과 동일하게 동작한다

**Todo**
1. useYoutubeList를 useSWR로 전환한다 (TTL 30분, 캐시 키: ['/youtube', stockName])
2. 페이지 토큰 상태를 SWR 응답에서 추출하도록 수정한다
3. goNext/goPrev를 pageToken 기반 SWR key 변경으로 구현한다

# BL-FE-66

**Backlog Type**
Behavior Backlog

**Backlog Title**
인증된 사용자가 페이지를 재방문하면 TTL 이내 캐시된 데이터가 즉시 반환된다

**배경**
현재 모든 페이지가 마운트마다 API를 재호출한다.
SWR 전역 Provider를 설정하여 dedupingInterval 기반 TTL 캐싱을 앱 전체에 적용한다.

**Success Criteria**
- `app/layout.tsx`에 SWRConfig Provider가 추가된다
- 전역 기본 TTL은 10분(dedupingInterval: 600_000)으로 설정된다
- 탭 전환(revalidateOnFocus: false) 시 재요청이 발생하지 않는다
- 네트워크 재연결(revalidateOnReconnect: true) 시 재요청이 발생한다

**Todo**
1. `infrastructure/swr/swrConfig.ts`에 전역 SWR 설정 객체를 정의한다
2. `app/layout.tsx`에 SWRConfig Provider를 추가한다

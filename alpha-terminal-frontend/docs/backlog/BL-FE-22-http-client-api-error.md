# BL-FE-22

**Backlog Type**
Infrastructure Backlog

**Backlog Title**
httpClient가 실패 응답 시 상태 코드와 서버 메시지를 담은 ApiError로 통일한다

**배경**
`httpClient`는 `Error("HTTP 401")` 형태만 던져 세부 메시지와 타입 구분이 어렵다.
`authApi`의 `ApiError`와 형태를 맞추면 대시보드·관심종목 등에서 일관된 오류 처리가 가능하다.

**Success Criteria**
- 공통 `ApiError`(status, message)가 한 곳에서 정의되고 `httpClient`가 이를 사용한다
- FastAPI `detail` 문자열(또는 배열)이 가능한 경우 사용자 메시지로 파싱된다
- 기존 `authApi`에서 `ApiError`를 import하는 코드는 동작을 유지한다

**Todo**
1. `infrastructure/http/apiError.ts`에 `ApiError`와 응답 본문 파싱 유틸을 둔다
2. `httpClient`의 get/post/delete에서 `!res.ok` 시 파싱 후 `ApiError`를 throw한다
3. `authApi`는 공통 `ApiError`를 사용하도록 정리한다

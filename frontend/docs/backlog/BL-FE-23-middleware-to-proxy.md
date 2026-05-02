# BL-FE-23

**Backlog Type**
Maintenance Backlog

**Backlog Title**
Next.js 16 권장에 따라 `middleware.ts`를 `proxy.ts`로 이전한다

**배경**
Next.js 16에서는 `middleware` 파일 컨벤션이 deprecated 되었고 `proxy`로 이름이 바뀌었다.
개발 서버 경고를 제거하고 이후 버전 호환을 맞춘다.

**Success Criteria**
- 프로젝트 루트에 `proxy.ts`가 있고 `export function proxy`로 동작한다
- `/dashboard`, `/watchlist`에 대한 쿠키 기반 리다이렉트 동작이 유지된다
- 닉네임 쿠키가 있을 때는 정상 통과(`NextResponse.next`)한다
- 기존 `middleware.ts`는 제거된다

**Todo**
1. `middleware.ts` 내용을 `proxy.ts`로 옮기고 함수명을 `proxy`로 바꾼다
2. 인증된 요청에 `NextResponse.next()`를 반환한다
3. `middleware.ts` 파일을 삭제한다

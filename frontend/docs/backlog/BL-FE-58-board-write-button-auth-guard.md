# BL-FE-58

**Backlog Type**
Feature / board / auth-guard

**Backlog Title**
게시판 쓰기 버튼 익명 사용자 숨김 — 읽기는 공개 유지

**Success Criteria**
- 비인증(익명) 사용자에게 NEW_POST 버튼이 표시되지 않는다
- 비인증 사용자에게 빈 목록의 "첫 게시물 작성하기" 버튼이 표시되지 않는다
- 게시물 목록 조회 및 상세 읽기는 인증 여부와 무관하게 가능하다
- 이미 create/edit 페이지는 자체 auth guard가 있으므로 추가 수정 불필요

**Todo**
1. [x] `app/board/page.tsx` 에 `authAtom` 읽기 추가
2. [x] `NEW_POST` 버튼 인증 사용자에게만 표시
3. [x] 빈 목록 "첫 게시물 작성하기" 버튼 인증 사용자에게만 표시

**개정 이력**
- 2026-03-31: 초안 및 구현

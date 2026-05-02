# TEST-05: 인증되지 않은 사용자가 네비게이션 바의 로그인 버튼을 클릭하면 시스템이 로그인 페이지를 출력한다

## Success Criteria

- 인증되지 않은 사용자가 네비게이션 바의 로그인 버튼을 클릭할 수 있다
- Login 버튼 클릭 시 /login 경로로 페이지가 이동한다
- 로그인 페이지가 정상적으로 화면에 출력된다
- 이 페이지는 Kakao, Google, Naver, Meta 등 여러 종류의 로그인 버튼을 보여줄 수 있다
- 클릭 시 백엔드 API(NEXT_PUBLIC_API_BASE_URL + NEXT_PUBLIC_KAKAO_LOGIN_PATH)로 OAuth 링크를 요청한다

## To-do

- [x] 로그인 페이지 라우트(/login)를 생성한다
- [x] 네비게이션 바의 Login 버튼 클릭 시 /login으로 이동하는 라우팅을 구현한다

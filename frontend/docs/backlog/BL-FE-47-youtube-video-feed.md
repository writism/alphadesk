# BL-FE-47 인증된 사용자가 영상 피드 페이지에 진입하면 시스템이 주식 종목 영상 리스트를 요청한다

## Backlog Type
Behavior Backlog

## 배경
인증된 사용자가 영상 피드 페이지에 진입하면 시스템이 백엔드 API를 통해 주식 종목 관련 YouTube 영상 리스트를 요청하고 표시한다.

## 도메인
youtube

## Success Criteria

- 인증된 사용자가 영상 피드 페이지에 진입하면 `GET /youtube/list` API를 요청한다
- API 응답으로 `items`, `next_page_token`, `prev_page_token`, `total_results`를 수신한다
- 각 영상 항목에는 `video_id`, `title`, `thumbnail_url`, `channel_name`, `published_at`, `video_url` 정보가 포함된다
- 데이터 로딩 중 로딩 상태가 사용자에게 표시된다
- 데이터 요청 실패 시 오류 메시지가 표시된다
- 1페이지에 9개 항목이 표시되며 페이지네이션이 동작한다

## Todo

1. 영상 리스트 데이터 요청 API 연동을 구현한다
2. 영상 리스트 상태 관리 로직을 구현한다
3. 로딩/에러/성공 상태에 따른 화면 전환을 구현한다
4. 영상 피드 페이지 UI를 구현한다
5. 페이지네이션 데이터 요청을 구현한다

## 상태
- [ ] 구현 전

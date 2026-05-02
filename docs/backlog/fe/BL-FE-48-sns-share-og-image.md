# BL-FE-48 등록된 사용자가 AI 분석 요약 카드를 OG 이미지와 함께 SNS에 공유한다

## Backlog Type
Behavior Backlog

## 배경
현재 공유 버튼이 SNS로 이동시키지만, 공유 URL이 사설 IP라 외부에서 접근 불가.
OG 이미지도 없어서 SNS 미리보기가 텍스트만 표시됨.
배포 시 즉시 동작하도록 코드를 준비한다.

## Success Criteria

- OG 이미지 API(`/api/og`)가 카드 데이터 기반 PNG를 동적 생성한다
- `/share/[cardId]` 메타태그에 `og:image`가 포함된다
- SNS 공유 모달에 카카오톡, 카카오스토리, 네이버 블로그 버튼이 추가된다
- 공유 URL이 `NEXT_PUBLIC_SHARE_BASE_URL` 환경변수로 설정 가능하다
- 카카오 JS SDK를 초기화하여 카카오톡/스토리 공유가 동작한다

## Todo

1. OG 이미지 생성 API를 구현한다
2. 공유 페이지 메타태그에 OG 이미지를 연결한다
3. 공유 URL을 환경변수 기반으로 변경한다
4. SNS 공유 모달에 카카오톡, 카카오스토리, 네이버 블로그를 추가한다
5. 카카오 JS SDK를 초기화한다

## 상태
- [ ] 구현 중

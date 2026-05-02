# BL-FE-49

**Backlog Type**  
Feature Backlog (프론트 주도, 백엔드 API 확장 포함)

**Backlog Title**  
게시판(BOARD)에 분석 카드를 등록·열람하고, SNS 공유는 작성자만 가능하게 한다

**배경**  
홈 메뉴 축소로 공유 카드 노출 공간이 줄어듦. 등록 사용자가 대시보드의 분석 카드를 **게시판 신규 글**처럼 올리고, 글 상세에서 **히트맵·좋아요·댓글**이 기존 카드와 동일하게 보이길 원함. 다만 **SNS/링크 공유(↗)** 는 카드를 게시한 본인에게만 노출되어야 함.

**Success Criteria**
- 로그인 사용자가 분석 카드에서 **게시판에 올리기**를 누르면 `card-share`로 카드가 생성(또는 기존 ID 사용)된 뒤 **게시글**이 생성되고 해당 **읽기 페이지**로 이동한다.
- 게시글에 연결된 `shared_card_id`가 있으면 읽기 화면에서 **StockSummaryCard 수준의 UI**(요약·감성·히트맵·좋아요·댓글)를 보여준다.
- 같은 화면에서 **공유하기(SNS)** 컨트롤은 **`sharer_account_id` = 현재 로그인 `account_id`** 일 때만 보인다.
- 일반 텍스트 게시글(연결 카드 없음)은 기존과 동일하게 동작한다.
- 백엔드: 게시글 생성 시 `shared_card_id`가 넘어오면 **해당 카드의 소유자가 요청자와 일치**하는지 검증한다.

**API (백엔드)**
- `POST /board` body에 선택 필드 `shared_card_id: int | null`
- `BoardListItemResponse`에 `shared_card_id: int | null` 포함 (목록·조회·생성 응답 일관)

**DB**
- `boards.shared_card_id` NULL 허용, `shared_cards.id` 참조(가능 시 FK). 기존 DB는 마이그레이션 SQL 실행 필요.
- 서버: `alpha-desk-ai-server/docs/migrations/20260328_boards_shared_card_id.sql`

**관련 백로그**
- [BL-FE-43](BL-FE-43-share-card-feature.md) — 공유 카드·액션 바
- [BL-FE-46](BL-FE-46-unshare-card.md) — 공유 취소

**Todo**
1. [x] DB 컬럼 및 마이그레이션 안내
2. [x] BE: 생성 검증·응답 필드
3. [x] FE: 게시판 올리기·읽기 UI·작성자만 SNS 공유

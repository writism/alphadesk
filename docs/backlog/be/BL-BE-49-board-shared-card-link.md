# BL-BE-49

**제목**  
게시글(`boards`)에 공유 분석 카드(`shared_cards`) 연결

**프론트 백로그**  
[BL-FE-49](../../../alpha-desk-frontend/docs/backlog/BL-FE-49-board-publish-analysis-card.md) (alpha-desk-frontend)

**구현**
- `boards.shared_card_id` (nullable, FK → `shared_cards.id`)
- `POST /board` body `shared_card_id` 선택 — 본인 소유 카드만 연결
- 응답·목록·조회에 `shared_card_id` 포함

**마이그레이션**  
`docs/migrations/20260328_boards_shared_card_id.sql`

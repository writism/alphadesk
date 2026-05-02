-- BL-FE-49: 게시글에 공유 분석 카드 연결
-- 기존 DB에만 실행 (신규 create_all로 테이블을 처음 만들 때는 ORM에 반영됨)

ALTER TABLE boards
    ADD COLUMN shared_card_id INT NULL,
    ADD CONSTRAINT fk_boards_shared_card
        FOREIGN KEY (shared_card_id) REFERENCES shared_cards (id);

# BL-FE-50: 분석 카드 → 게시판 공유 기능

## 상태: 구현 완료 (기존 코드로 이미 동작)

## 요구사항

1. 홈 메뉴가 제거되면서 분석 카드를 공유할 공간이 사라짐
2. 사용자가 대시보드에서 분석 카드를 게시판(BOARD)에 새글로 등록하여 공유
3. 게시판에서 분석 카드 UI가 그대로 보여야 함 (히트맵, 좋아요/댓글 버튼 등)
4. SNS 공유하기 버튼은 카드를 등록한 본인에게만 표시 (다른 사용자에게는 숨김)

## 현재 구현 상태

### 대시보드 → 게시판 등록 흐름
- `DashboardSummarySection.tsx`: `showBoardPublishButton={isLoggedIn}` 으로 로그인 사용자에게 "게시판에 올리기" 버튼 표시
- `ShareActionBar.tsx`: `handlePublishToBoard()` — 카드를 `POST /card-share`로 공유 후, `createBoardPost(title, content, shared_card_id)` 로 게시글 생성
- 등록 완료 시 `router.push(/board/read/{board_id})` 로 자동 이동

### 게시판에서 분석 카드 표시
- `board/read/[id]/page.tsx`: `shared_card_id` 가 있으면 `fetchSharedCard()` 로 카드 데이터 로딩
- `StockSummaryCard` 컴포넌트로 완전한 분석 카드 UI 렌더링 (히트맵, 태그, 감성 점수, 신뢰도 바)
- 좋아요/댓글 버튼 포함

### 공유 권한 제어
- `board/read/[id]/page.tsx`: `isCardOwner` 판별 — `sharedCard.sharer_account_id === currentAccountId`
- `snsShareEnabled={isCardOwner}` — 카드 소유자만 SNS 공유 버튼 표시
- 다른 사용자는 좋아요/댓글만 가능, 공유하기 버튼 숨김

### 게시판 목록에서 AI 카드 표시
- `board/page.tsx`: `shared_card_id != null` 이면 [AI] 뱃지 표시

## 관련 파일

| 파일 | 역할 |
|------|------|
| `app/dashboard/components/DashboardSummarySection.tsx` | "게시판에 올리기" 버튼 활성화 |
| `features/share/ui/components/ShareActionBar.tsx` | 게시판 등록 로직 (handlePublishToBoard) |
| `features/board/infrastructure/api/boardApi.ts` | createBoardPost(title, content, shared_card_id) |
| `app/board/read/[id]/page.tsx` | 분석 카드 표시 + 소유자 권한 제어 |
| `app/board/page.tsx` | 목록에서 AI 뱃지 표시 |
| `app/components/StockSummaryCard.tsx` | 분석 카드 UI (히트맵, 감성, 태그 등) |
| `features/share/infrastructure/api/shareApi.ts` | shareCard, fetchSharedCard API |

## 데이터 흐름

```
[대시보드] 분석 카드
    ↓ "게시판에 올리기" 클릭
POST /card-share → shared_card (id 발급)
    ↓
POST /board → board_post (shared_card_id 연결)
    ↓
[게시판 읽기] GET /board/read/{id}
    ↓ shared_card_id 있으면
GET /card-share/{id} → StockSummaryCard 렌더링
    ↓ isCardOwner 판별
snsShareEnabled = 본인만 true
```

# BL-FE-43

**Backlog Type**
Feature

**Backlog Title**
AI 분석 카드 공유 — 프론트엔드 (액션 바 · 댓글 · SNS 공유 · 홈 피드 · 공개 페이지)

---

## 1. 배경

사용자가 대시보드 AI 분석 카드를 공유하면:
1. 카드 하단에 좋아요(♥) · 댓글 · 공유 액션 바가 노출
2. 공유된 카드는 홈 화면 피드에 표시
3. 공유 링크를 SNS에 올리면 카드 미리보기(OG 메타태그)가 보임

---

## 2. 기능 상세

### 2-1. 카드 액션 바 (ShareActionBar)

대시보드 `StockSummaryCard` 하단에 추가:

```
[♥ 좋아요 N]  [💬 댓글 N]  [↗ 공유]
```

- **좋아요**: 익명/로그인 사용자 모두 가능. IP 기반 중복 방지. 클릭 즉시 카운트 낙관적 업데이트.
- **댓글**: 클릭 시 댓글 모달 열림.
- **공유**: 클릭 시 SNS 공유 모달 열림. 공유 전에는 공유하기 버튼 먼저 표시(로그인 필요).

### 2-2. 댓글 모달 (CommentModal)

- 댓글 목록 (작성자 닉네임 or '익명', 내용, 시간)
- 댓글 입력: 120자 제한, 남은 글자 수 표시
- 닉네임 입력 (선택, placeholder: '익명')
- 제출 버튼

### 2-3. SNS 공유 모달 (SNSShareModal)

공유 옵션:
- 링크 복사 (클립보드)
- Twitter/X 공유 (`https://twitter.com/intent/tweet?text=...&url=...`)
- 카카오톡 공유 (Kakao SDK - 이미지·제목·설명·링크 포함)
- 페이스북 공유

공유 URL 형태: `https://[domain]/share/{card_id}`

### 2-4. 홈 화면 공유 피드 (SharedCardFeed)

홈(`/`) 하단에 "공유된 AI 분석" 섹션 추가:
- 최신 공유 카드 목록 (최대 10개)
- 각 카드: 종목명 · 요약 · 감성 배지 · 좋아요 수 · 댓글 수 · 공유자 닉네임

### 2-5. 공개 공유 페이지 (`/share/[cardId]`)

SNS 공유 링크 대상 페이지:
- SSR로 OG 메타태그 생성 (`generateMetadata`)
- 카드 전체 내용 표시
- 좋아요 · 댓글 액션 가능 (익명 포함)
- "Alpha Desk에서 보기" 버튼

---

## 3. 아키텍처 구조 (DDD)

```
features/share/
  domain/model/
    sharedCard.ts          # SharedCard, CardComment 타입
  application/hooks/
    useSharedCards.ts      # 공유 카드 목록 조회
    useCardActions.ts      # 좋아요·댓글·공유 액션
  infrastructure/api/
    shareApi.ts            # 백엔드 API 호출
  ui/components/
    ShareActionBar.tsx     # 카드 하단 액션 바
    CommentModal.tsx       # 댓글 입력/목록
    SNSShareModal.tsx      # SNS 공유 옵션
    SharedCardFeed.tsx     # 홈 피드 카드 목록

app/share/[cardId]/
  page.tsx                 # 공개 공유 페이지 (SSR OG)
```

---

## 4. Success Criteria

| ID | 기준 |
|----|------|
| SC-1 | 로그인 사용자가 카드 공유 → 홈 피드에 표시 |
| SC-2 | 좋아요 클릭 시 카운트 즉시 반영 (낙관적 업데이트) |
| SC-3 | 댓글 120자 초과 시 제출 버튼 비활성화 |
| SC-4 | SNS 공유 모달에서 링크 복사 동작 확인 |
| SC-5 | `/share/{id}` 페이지에서 OG 메타태그 포함 확인 |
| SC-6 | 홈 피드에 최신 공유 카드 목록 표시 |
| SC-7 | 비로그인 사용자도 좋아요·댓글 가능 |
| SC-8 | `tsc` 통과 |

---

## 5. 변경 파일

| 파일 | 변경 |
|------|------|
| `features/share/**` | 신규 feature 모듈 |
| `app/components/StockSummaryCard.tsx` | `onShare` prop + ShareActionBar 조건부 렌더 |
| `app/page.tsx` | SharedCardFeed 섹션 추가 |
| `app/share/[cardId]/page.tsx` | 신규 공개 페이지 |

---

## 6. 완료 정의

- [ ] SC-1 ~ SC-8 통과
- [ ] 모바일·데스크톱 시각 확인

# 에러 리포트: 공유 카드 좋아요/댓글 실시간 동기화 문제

**작성일**: 2026-03-26
**영향 범위**: 공유 카드 피드 (`/` 홈 화면), 공유 카드 상세 (`/share/[cardId]`)
**심각도**: Medium — 데이터 불일치, UX 저하

---

## 1. 증상

| # | 현상 | 재현 경로 |
|---|------|-----------|
| 1 | 모바일에서 좋아요를 누르면 웹에서 카운트가 증가하지 않음 | 모바일 → 하트 클릭 → 웹 확인 |
| 2 | 모바일에서 댓글을 추가해도 웹 댓글 수가 변하지 않음 | 모바일 → 댓글 등록 → 웹 확인 |
| 3 | 같은 WiFi 내 로그인 사용자 A가 좋아요한 카드에 익명 사용자가 좋아요 불가 | 로그인 후 좋아요 → 같은 IP 익명 하트 클릭 |
| 4 | `crypto.randomUUID is not a function` 콘솔 에러 | HTTP 환경(비 HTTPS)에서 좋아요 클릭 |

---

## 2. 근본 원인 분석

### 2-1. 동기화 미동작 (증상 1, 2)

**원인 A — `useState` 초기값 고정**
`useCardActions`의 `likeCount`/`liked` 상태는 `useState(initialValue)`로 초기화된 후 SWR 폴링으로 card props가 갱신되어도 자동으로 업데이트되지 않음.

```ts
// 문제 코드
const [likeCount, setLikeCount] = useState(initialLikeCount) // 한 번만 적용
const [liked, setLiked] = useState(initialLiked)
```

**원인 B — 댓글 카운트 표시 로직 오류**
`{commentCount || card.comment_count}` — 사용자가 모달을 한 번이라도 열면 `commentCount`가 3(truthy)이 되어 폴링으로 갱신된 `card.comment_count = 4`를 덮어쓰는 단락 평가 버그.

```ts
// 문제 코드
💬 {commentCount || card.comment_count}  // commentCount=3이면 4를 무시

// 수정 코드
💬 {card.comment_count}  // 폴링 데이터 직접 사용
```

**원인 C — SWR 전환 후 `mutate()` 동작 불확실**
최초 구현에서 `reload: mutate`로 SWR bound mutator를 그대로 전달. SWR v2에서 `mutate()` no-args 호출이 `dedupingInterval` 또는 내부 큐 타이밍과 충돌해 즉시 재요청이 보장되지 않음.

```ts
// 문제 코드
reload: mutate  // SWR 내부 revalidation 큐에 위임 → 타이밍 불확실

// 수정 코드
reload: () => mutate(fetchSharedCards(limit, 0), { revalidate: false })
// fresh Promise 직접 주입
```

**원인 D — 폴링 전략 미비**
초기 구현(30초 `setInterval`)에서 SWR로 전환하면서 `refreshInterval: 0`으로 폴링을 완전 제거. `revalidateOnFocus`만으로는 탭을 전환하지 않는 이상 타 기기 변경 사항이 반영되지 않음.

```ts
// 문제 코드
refreshInterval: 0  // 다른 기기 변경 시 절대 감지 안 됨

// 수정 코드
refreshInterval: 15_000,      // 15초 주기 (탭이 보일 때만)
refreshWhenHidden: false,     // 백그라운드 탭에서 중단
```

---

### 2-2. 익명 좋아요 충돌 (증상 3)

**원인 — DB 유니크 제약 설계 결함**

`card_likes` 테이블의 `uq_card_like_ip` 제약:
```sql
UNIQUE (shared_card_id, liker_ip)
```

로그인 사용자 A(account_id=1, ip=192.168.x.x)가 좋아요하면 레코드에 `liker_ip=192.168.x.x` 저장됨. 이후 같은 WiFi 내 익명 사용자(account_id=NULL, ip=192.168.x.x)가 좋아요 시도 → `IntegrityError` 발생 → rollback → 추가 실패. 그러나 router는 이 실패를 무시하고 `liked=True, like_count=1(기존값)`을 반환 → 프론트에서 낙관적 업데이트(+1)와 서버 응답(변화 없음) 불일치로 카운트가 튐.

**영향 범위**: 같은 네트워크(같은 공인 IP) 내 모든 사용자 간 충돌.

**수정 방법**:
`liker_ip` 컬럼을 실제 IP가 아닌 "식별자"로 사용하는 `_get_like_identity()` 도입.
- 로그인 사용자: `"account:{account_id}"` 저장 → IP 무관, 계정 단위 유니크
- 익명 사용자: `guest_id` 쿠키(UUID) 저장 → 기기 단위 유니크

```python
def _get_like_identity(request, account_id):
    if account_id:
        return f"account:{account_id}"
    return request.cookies.get("guest_id") or _get_client_ip(request)
```

---

### 2-3. `crypto.randomUUID` 에러 (증상 4)

**원인**: `crypto.randomUUID()`는 Secure Context(HTTPS)에서만 사용 가능. 개발 환경의 HTTP(`192.168.x.x:3000`) 접속 시 미지원.

```ts
// 문제 코드
const id = crypto.randomUUID()  // HTTP에서 TypeError

// 수정 코드
const id = typeof crypto?.randomUUID === "function"
    ? crypto.randomUUID()
    : generateUUID()  // Math.random() 기반 폴백
```

---

## 3. 수정 이력

| 날짜 | 수정 내용 | 파일 |
|------|----------|------|
| 2026-03-26 | `uq_card_like_ip` 충돌 → `_get_like_identity()` 도입 | `card_share_router.py` |
| 2026-03-26 | `useCardActions` — `initialLikeCount` 변경 시 `useEffect` 동기화 | `useCardActions.ts` |
| 2026-03-26 | 댓글 카운트 표시 — `||` 단락 평가 제거, `card.comment_count` 직접 사용 | `SharedCardFeed.tsx` |
| 2026-03-26 | `crypto.randomUUID` HTTP 환경 폴백 추가 | `guestName.ts` |
| 2026-03-26 | SWR 도입, `refreshInterval: 15s` + `refreshWhenHidden: false` 적용 | `useSharedCards.ts` |
| 2026-03-26 | SWR `reload` — `mutate(Promise)` 직접 주입으로 즉시 갱신 보장 | `useSharedCards.ts` |

---

## 4. 잔존 한계

- **실시간성**: 최대 15초 지연 (WebSocket/SSE 미도입)
- **익명 좋아요 쿠키 의존**: 쿠키 삭제 시 동일 카드 재좋아요 가능
- **`liker_ip` 컬럼 오용**: 실제 IP가 아닌 식별자를 저장하므로 컬럼명이 misleading — 향후 `liker_identity`로 rename 권장 (Alembic 마이그레이션 필요)

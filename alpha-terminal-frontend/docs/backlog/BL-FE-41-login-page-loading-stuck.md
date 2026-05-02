# BL-FE-41

**Backlog Type**
Bug

**Backlog Title**
로그인 페이지 — "인증 확인 중..." 에서 멈춤 (loadUser 미호출)

---

## 1. 배경

로그인 버튼(`/login`)을 클릭하면 페이지가 "인증 확인 중..." 텍스트만 표시한 채
카카오 로그인 버튼이 나타나지 않고 진행이 멈춘다.

---

## 2. 원인

`features/auth/application/atoms/authAtom.ts`:

```typescript
export const authStateAtom = atom<AuthState>({ status: "LOADING" })
```

초기값이 `LOADING`이며, `app/login/page.tsx`는 `useAuth()`로 상태를 읽기만 하고
**`loadUser()`를 호출하지 않는다.**

`loadUser()`는 브라우저 쿠키에서 인증 정보를 동기적으로 읽어
`LOADING → AUTHENTICATED | UNAUTHENTICATED`로 전환하는 역할을 한다.
이 호출이 없으니 상태가 영원히 `LOADING`에 머문다.

```typescript
// login/page.tsx — loadUser() 호출 없음
const { state } = useAuth()

if (state.status === "LOADING") {
    return <p>인증 확인 중...</p>  // 여기서 멈춤
}
```

---

## 3. 해결 방향

`login/page.tsx` 마운트 시 `loadUser()`를 호출한다.

```typescript
const { state, loadUser } = useAuth()

useEffect(() => {
    loadUser()
}, [loadUser])
```

`detectAuthState()`는 동기 함수(쿠키 읽기)이므로
다음 렌더 사이클에서 즉시 `UNAUTHENTICATED` 또는 `AUTHENTICATED`로 전환된다.

---

## 4. Success Criteria

| ID | 기준 |
|----|------|
| SC-1 | 로그인 페이지 접속 시 카카오 로그인 버튼이 표시된다 |
| SC-2 | 이미 로그인된 상태라면 홈(`/`)으로 리다이렉트된다 |
| SC-3 | "인증 확인 중..."이 무한 지속되지 않는다 |
| SC-4 | `tsc` 통과 |

---

## 5. 변경 파일

| 파일 | 변경 |
|------|------|
| `app/login/page.tsx` | 마운트 시 `loadUser()` 호출 추가 |

---

## 6. 완료 정의

- [ ] SC-1 ~ SC-4 통과

# BL-FE-42

**Backlog Type**
Bug / UX

**Backlog Title**
NavBar — 모바일 반응형 + 사용자 정보 표시 (ui/layout/Navbar 전환)

---

## 1. 배경

`app/layout.tsx`는 `components/NavBar.tsx` (System A, 구버전)를 사용 중이다.

이로 인해 두 가지 문제가 발생한다.

**문제 1 — 모바일 레이아웃 깨짐**
모바일에서 로고·메뉴·로그아웃이 한 줄에 나열되어
텍스트가 글자 단위로 줄바꿈되고 UI가 압축된다.

**문제 2 — 로그인 사용자 정보 미표시**
System A(`authAtom`)는 `AUTHENTICATED | UNAUTHENTICATED` 값만 저장하며
닉네임·이메일 등 사용자 정보를 보유하지 않는다.
반면 `ui/layout/Navbar.tsx` (System B)는 쿠키에서 닉네임·이메일을 읽어 표시한다.

BL-FE-38(모바일 드로어), BL-FE-27(유저 정보 레이블)에 따라 `ui/layout/Navbar.tsx`가
이미 구현되어 있으나 레이아웃에 연결되지 않은 상태다.

---

## 2. 해결 방향

### 2-1. `ui/layout/Navbar.tsx`에 `loadUser()` 마운트 호출 추가

```typescript
const { state, logout, loadUser } = useAuth()

useEffect(() => {
    loadUser()   // 쿠키 기반 인증 상태를 즉시 감지
}, [loadUser])
```

### 2-2. `app/layout.tsx`의 NavBar를 새 Navbar로 교체

```typescript
// Before
import NavBar from "@/components/NavBar"

// After
import Navbar from "@/ui/layout/Navbar"
```

### 2-3. `ui/layout/Navbar.tsx` 메뉴 한국어화 + 게시판 추가

| 기존(영문) | 변경(한국어) |
|-----------|------------|
| Home | 홈 |
| Dashboard | 대시보드 |
| Watchlist | 관심종목 |
| — | 게시판 (/board 추가) |
| Login | 로그인 |
| Logout | 로그아웃 |

드로어(mobile drawer) 메뉴도 동일하게 한국어 적용.

---

## 3. Success Criteria

| ID | 기준 |
|----|------|
| SC-1 | 모바일에서 로고 + 햄버거만 표시되고 나머지 메뉴는 드로어에서 열린다 |
| SC-2 | 데스크톱에서 대시보드·관심종목·게시판·사용자 정보·로그아웃이 가로 배치된다 |
| SC-3 | 로그인 상태에서 상단 바에 닉네임·이메일이 표시된다 |
| SC-4 | 비로그인 모바일에서 로그인 버튼만 표시된다 |
| SC-5 | `tsc` 통과 |

---

## 4. 변경 파일

| 파일 | 변경 |
|------|------|
| `ui/layout/Navbar.tsx` | `loadUser()` 마운트 호출 추가, 메뉴 한국어화, 게시판 링크 추가 |
| `app/layout.tsx` | `components/NavBar` → `ui/layout/Navbar` 전환 |

---

## 5. 완료 정의

- [ ] SC-1 ~ SC-5 통과
- [ ] 모바일·데스크톱 시각 확인

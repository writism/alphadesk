# BL-FE-62: 사용자가 /profile 페이지에서 관심종목과 상호작용 이력을 확인한다

> **담당**: 최승호 | **단계**: 1단계 | **주차**: Week 1~2

## 배경

사용자가 자신의 관심종목, 최근 클릭한 카드 이력, 프로필 정보를 한 곳에서 확인하고
수정할 수 있는 페이지가 필요하다.

## Success Criteria

- `/profile` 페이지 접근 시 로그인 여부를 확인하고 미로그인 시 `/login`으로 리다이렉트한다
- `GET /api/users/{userId}/profile` 호출 결과로 관심종목 카드 목록이 렌더링된다
- 상호작용 이력(최근 본 뉴스/공시 카드)이 날짜순으로 표시된다
- 닉네임 수정 기능이 동작한다

## To-do

- [ ] `UserProfile` 도메인 모델 정의 (`features/profile/domain/model/userProfile.ts`)
- [ ] `getUserProfile(userId)` API 함수 구현 (`features/profile/infrastructure/api/profileApi.ts`)
- [ ] `useUserProfile` 훅 구현 (`features/profile/application/hooks/useUserProfile.ts`)
- [ ] `ProfilePage` UI 컴포넌트 구현 (`features/profile/ui/components/ProfilePage.tsx`)
- [ ] `app/profile/page.tsx` 라우트 생성
- [ ] Navbar에 프로필 링크 추가

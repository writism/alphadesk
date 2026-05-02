# BL-FE-64: 사용자가 헤더 알림 아이콘으로 새 알림을 확인한다

> **담당**: 김민식 | **단계**: 3단계 | **주차**: Week 3~4

## 배경

능동형 추천 에이전트가 생성한 알림을 사용자가 앱에서 확인할 수 있도록
헤더 알림 아이콘, 읽지 않은 뱃지, 인박스 드롭다운, 토스트 팝업이 필요하다.

## Success Criteria

- Navbar 우측에 알림 벨 아이콘이 표시된다
- 읽지 않은 알림이 있으면 빨간 뱃지(숫자)가 표시된다
- 벨 아이콘 클릭 시 알림 인박스 드롭다운이 열린다
- 드롭다운에 알림 목록이 최신순으로 표시된다
- 알림 클릭 시 읽음 처리되고 관련 페이지로 이동한다
- "모두 읽음" 버튼이 동작한다
- 새 알림 도착 시(페이지 진입 시) 토스트 팝업이 표시된다

## To-do

- [ ] `Notification` 도메인 모델 정의 (`features/notification/domain/model/notification.ts`)
- [ ] 알림 API 함수 구현 (`features/notification/infrastructure/api/notificationApi.ts`)
  - `getNotifications()`, `getUnreadCount()`, `markAsRead(id)`, `markAllAsRead()`
- [ ] `useNotification` 훅 구현 (`features/notification/application/hooks/useNotification.ts`)
- [ ] `NotificationBell` 컴포넌트 — 벨 아이콘 + 뱃지 (`features/notification/ui/components/NotificationBell.tsx`)
- [ ] `NotificationInbox` 드롭다운 컴포넌트 (`features/notification/ui/components/NotificationInbox.tsx`)
- [ ] `NotificationToast` 컴포넌트 (`features/notification/ui/components/NotificationToast.tsx`)
- [ ] `ui/layout/Navbar.tsx`에 `NotificationBell` 추가

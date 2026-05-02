# BL-FE-75: articleMode localStorage 영속화

## 문제
- My Page에서 설정한 `articleMode`가 Jotai atom에만 저장됨
- 페이지 새로고침 시 항상 기본값 `latest_3`으로 초기화됨
- `briefingSettings`는 localStorage에 저장되는데 `articleMode`만 누락

## 목표
- `articleMode` 변경 시 localStorage에 저장
- 앱 로드 시 localStorage에서 읽어 atom 초기화

## 구현 위치
- `features/my/infrastructure/api/myApi.ts` — localStorage 헬퍼 추가
- `features/my/application/hooks/useMySettings.ts` — 로드/저장 연결

## 완료 기준
- My Page에서 articleMode 변경 후 새로고침해도 설정 유지

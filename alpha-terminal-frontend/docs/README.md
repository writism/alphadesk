# Frontend Docs Guide

`alpha-terminal-frontend/docs`의 문서를 빠르게 찾기 위한 인덱스입니다.

## 주요 폴더

| 경로 | 용도 |
|---|---|
| `backlog/` | 프론트 백로그 구현 문서 (`BL-FE-*`) |
| `meta/` | 세션 메모, 작업 로그 |

## 먼저 볼 문서

- 뉴스 기능 백로그: `backlog/BL-FE-28-news-search.md`, `backlog/BL-FE-60-news-list-pagination.md`
- 모바일/내비게이션 관련: `backlog/BL-FE-38-mobile-navbar-drawer.md`, `backlog/BL-FE-42-navbar-switch-to-responsive-with-userinfo.md`, `backlog/BL-FE-51-navbar-stock-recommendation-link.md`
- 공유/OG 이미지: `backlog/BL-FE-48-sns-share-og-image.md`, `PLAN-og-image-sns-share.md`
- 최근 배포/정리 메모: `COMMIT-PR-20260321.md`, `UPSTREAM-MERGE-20260321.md`

## 이슈/리포트

- `ISSUE-03-logout-401.md`
- `ISSUE-01-temp-token-httonly.md`
- `ERROR-REPORT-share-sync-2026-03-26.md`
- `FIXLIST-FE-applied.md`

## 테스트 메모

- `TEST-01-env-config.md`
- `TEST-02-kakao-auth-flow.md`
- `TEST-03-temp-token-terms-page.md`
- `TEST-04-kakao-login-button-design.md`
- `TEST-05-login-page-routing.md`
- `TEST-06-navbar-menu-design.md`
- `TEST-07-navbar-sticky-layout.md`

## 리서치/계획 문서

- `RESEARCH-alpha-desk-home-feature-ideas.md`
- `RESEARCH-sentiment-heatmap-correlation-ui.md`
- `PLAN-og-image-sns-share.md`

## 통합/배포 메모

- `frontend_kakao_auth_integration.md`
- `FE-07-08-backend-integration.md`
- `DEPLOY-ORACLE-CLOUD.md`
- `COMMIT-PR-20260321.md`
- `UPSTREAM-MERGE-20260321.md`

## 백로그 탐색 포인트

- 인증/회원가입 흐름: `BL-FE-08` ~ `BL-FE-18`
- 대시보드/파이프라인 UX: `BL-FE-19` ~ `BL-FE-40`
- 공유 카드/게시판: `BL-FE-43` ~ `BL-FE-50`
- 내비게이션/레이아웃 일관성: `BL-FE-38`, `BL-FE-42`, `BL-FE-51`, `BL-FE-59`
- 뉴스/콘텐츠 피드: `BL-FE-28`, `BL-FE-47`, `BL-FE-48`, `BL-FE-60`

## 정리 규칙

- 기능 구현 문서는 `backlog/`에 우선 배치합니다.
- 작업 세션 로그는 `meta/`에 둡니다.
- 루트의 `ISSUE-*`, `TEST-*`, `RESEARCH-*`, `PLAN-*` 문서는 현 시점 탐색을 위해 유지하되, 새 문서를 추가할 때는 목적에 맞는 하위 폴더를 먼저 검토합니다.
- 배포/병합/정리 보고 문서는 루트에 남기되, 제목 접두어를 일관되게 유지합니다.

# 세션 기록: 2026-03-25 — 모바일 OAuth 인증 & API 프록시 수정

전체 내용은 **alpha-desk-ai-server** `docs/meta/SESSION-2026-03-25-mobile-auth-proxy-fix.md` 참조.

## 이 저장소 변경 (BL-FE-37)

- `next.config.ts` — rewrites 추가: `/api/:path*` → `http://localhost:33333/:path*`
- `.env.local` — `NEXT_PUBLIC_API_BASE_URL` → `/api`
- `.env.example` — 동일 업데이트 + 주석
- `docs/backlog/BL-FE-37-nextjs-rewrite-api-proxy.md` — 백로그 신규 생성

## PR

- **업스트림 PR:** https://github.com/EDDI-RobotAcademy/alpha-desk-frontend/pull/19 (OPEN)
- **브랜치:** `feat/bl-fe-30-37-heatmap-pagination-proxy`

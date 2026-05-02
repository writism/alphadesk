# AlphaDesk 문서

AlphaDesk 모노레포의 통합 문서 디렉토리.  
백엔드(`ai-server`), 프론트엔드(`frontend`) 각각에 분산되어 있던 문서를 이 디렉토리로 통합했다.

---

## 디렉토리 구조

```
docs/
├── architecture/       아키텍처 설계 문서 및 ADAIS 강의 노트
├── deployment/         배포 가이드 (Vercel+Railway, Oracle Cloud, AWS EC2)
├── development/        개발 환경, 카카오 연동, KRX 동기화 등 운영 가이드
├── database/           MySQL/PostgreSQL 스키마, Alembic 마이그레이션
├── api-testing/        Bruno/Postman API 테스트 컬렉션
├── backlog/
│   ├── be/             백엔드 백로그 (BL-BE-*)
│   └── fe/             프론트엔드 백로그 (BL-FE-*)
├── issues/             버그 리포트 및 해결 기록
├── tests/
│   ├── be/             백엔드 수동 테스트 시나리오
│   ├── fe/             프론트엔드 수동 테스트 시나리오
│   └── fixtures/       테스트용 픽스처 데이터
├── research/           기능 리서치 및 기획 문서
├── changelogs/         릴리즈/리팩토링 변경 이력
└── meta/               세션 기록, 발표 자료
```

---

## 빠른 참조

| 목적 | 문서 |
|------|------|
| 로컬 서버 시작/종료 | [development/server-guide.md](development/server-guide.md) |
| Vercel + Railway 배포 | [deployment/vercel-railway.md](deployment/vercel-railway.md) |
| 현재 배포 상태 | [deployment/status.md](deployment/status.md) |
| MVP 진행 현황 | [development/mvp-status.md](development/mvp-status.md) |
| 아키텍처 감사 보고서 | [architecture/overview.md](architecture/overview.md) |
| DB 마이그레이션 가이드 | [database/alembic-guide.md](database/alembic-guide.md) |
| 카카오 인증 연동 | [development/kakao-auth-integration.md](development/kakao-auth-integration.md) |
| 팀 역할 | [development/team-roles.md](development/team-roles.md) |

---

## 백로그

- 백엔드: `backlog/be/BL-BE-{번호}-{설명}.md`
- 프론트엔드: `backlog/fe/BL-FE-{번호}-{설명}.md`

---

## 파일 네이밍 규칙

- 소문자 케밥 케이스(`kebab-case`)
- 날짜가 포함된 changelog는 `YYYY-MM-DD-설명.md` 형식
- 이슈 문서는 `{be|fe}-{번호}-{설명}.md` 형식

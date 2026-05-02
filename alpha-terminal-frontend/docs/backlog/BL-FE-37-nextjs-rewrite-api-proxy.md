# BL-FE-37

**Backlog Type**
Maintenance / Infrastructure

**Backlog Title**
Next.js rewrites로 백엔드 API 프록시 적용 — 모바일 환경 localhost 문제 해결

---

## 1. 배경

- 프론트엔드 클라이언트 코드에서 `NEXT_PUBLIC_API_BASE_URL=http://localhost:33333`을 직접 참조한다.
- 모바일(또는 외부 기기)에서 `http://192.168.1.1:3000`으로 접근하면, 브라우저가 **기기 자신의 localhost:33333**에 접속을 시도해 연결 실패가 발생한다.
- 대표 증상: 카카오 인증 버튼 클릭 시 "localhost:33333 사이트에 연결할 수 없음"

## 2. 해결 방향

Next.js `next.config.ts`의 `rewrites`를 활용해 클라이언트가 **항상 동일 호스트의 `/api/...`** 를 호출하도록 변경한다.
Next.js 서버가 `/api/*` 요청을 `http://localhost:33333/*`로 프록시한다.

```
[클라이언트]  /api/kakao-authentication/...
                  ↓ Next.js 서버가 프록시 (서버 내부)
              http://localhost:33333/kakao-authentication/...
```

## 3. 변경 범위

| 파일 | 변경 내용 |
|------|-----------|
| `next.config.ts` | `rewrites()` 추가: `/api/:path*` → `http://localhost:33333/:path*` |
| `infrastructure/http/httpClient.ts` | `BASE_URL`을 `http://localhost:33333` → `/api` 로 변경 |
| `.env.local` | `NEXT_PUBLIC_API_BASE_URL` 값을 `/api` 로 변경 (또는 제거) |

## 4. Success Criteria

| ID | 기준 |
|----|------|
| SC-1 | 모바일(외부 기기)에서 카카오 인증 버튼 클릭 시 백엔드 API 정상 호출된다. |
| SC-2 | 로컬 개발 환경(팀원 각 PC)에서 기존과 동일하게 동작한다. |
| SC-3 | 클라이언트 JS에 `localhost:33333`이 노출되지 않는다. |
| SC-4 | `tsc` 및 `npm run lint` 통과. |

## 5. 비범위

- 백엔드 서버 설정 변경
- HTTPS / 도메인 설정

## 6. 완료 정의

- [ ] `next.config.ts` rewrites 적용
- [ ] `httpClient.ts` BASE_URL `/api` 로 변경
- [ ] 모바일 접속 테스트 통과
- [ ] `tsc` 통과

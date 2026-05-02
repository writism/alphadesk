# 카카오톡 공유 설정 체크리스트

## 현상

`window.Kakao.Share.sendDefault()` 호출 시 아래 에러 발생:

```
요청 실패
카카오계정과 카카오톡이 연결되어 있지 않습니다
카카오톡의 [더보기] > [설정] > [카카오계정]에서 로그인 후 다시 시도해 주세요
```

카카오 계정으로 앱 로그인 및 카카오톡 로그인이 모두 된 상태에서도 발생.

## 실제 원인 (2026-04-28 해결)

**Kakao Developers 콘솔 → 앱 설정 → 플랫폼 키 → JavaScript 키**에
`https://alphaterminal.duckdns.org` 도메인이 미등록 상태.

카카오톡 공유 JS SDK는 JavaScript 키에 등록된 도메인에서만 동작함.
"카카오계정 연결 안 됨" 에러가 실제로는 도메인 미등록으로 발생할 수 있음.

## 도메인 등록 경로

Kakao Developers 콘솔 (https://developers.kakao.com):

1. **앱 설정 → 제품 링크 관리 → 웹 도메인**에 추가
2. **앱 설정 → 플랫폼 키 → JavaScript 키**에 추가 ← 카카오톡 공유의 핵심

두 곳 모두 등록 필요.

## 코드 위치

- SDK 초기화: `features/share/ui/components/KakaoSDKLoader.tsx`
- 공유 호출: `features/share/ui/components/SNSShareModal.tsx` — `handleKakaoTalk()`
- JS Key 환경변수: `NEXT_PUBLIC_KAKAO_JS_KEY` (FE `.env` 및 GitHub `FRONTEND_ENV` 시크릿)

## 완료 상태 (2026-04-28)

- [x] 플랫폼 키 → JavaScript 키에 `https://alphaterminal.duckdns.org` 등록
- [x] 제품 링크 관리 → 웹 도메인에 `https://alphaterminal.duckdns.org` 등록
- [x] 실제 카카오톡 공유 동작 검증 완료

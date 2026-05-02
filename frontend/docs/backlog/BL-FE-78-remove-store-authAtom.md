# BL-FE-78: store/authAtom.ts 제거

## 문제

`store/authAtom.ts` 가 `features/auth/application/atoms/authAtom.ts` 를 역방향으로 import 한다.

```
store/ → features/auth/application/atoms/  (아키텍처 규칙 위반)
```

`store/authAtom.ts` 는 `authStateAtom` 의 derived read-only atom 만 두 개 정의한다.

- `authAtom`: `authStateAtom.status` 를 string 으로 뽑는 derived atom
- `isAuthenticatedAtom`: `authAtom === "AUTHENTICATED"` 파생

현재 이 파일을 import 하는 파일이 없다(grep 확인). 사용되지 않는 dead code 이면서
아키텍처 레이어 방향을 위반하는 구조적 오염원이다.

## 해결 방안

`store/authAtom.ts` 파일 삭제.

`isAuthenticatedAtom` 과 기능이 동일한 `isLoggedInAtom` 이 이미
`features/auth/application/selectors/authSelectors.ts` 에 존재하므로 대체 불필요.

## 범위

- `store/authAtom.ts` (삭제)

## 완료 기준

- `store/authAtom.ts` 파일 제거
- 다른 파일에 import 영향 없음 (현재 import 없음 확인됨)

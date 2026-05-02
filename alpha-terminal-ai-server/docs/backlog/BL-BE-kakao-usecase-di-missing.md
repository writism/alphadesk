# BL-BE-kakao-usecase-di-missing

**Backlog Type**
Bug

**Backlog Title**
kakao_authentication_router — CheckKakaoUserRegistrationUseCase DI 인자 누락 + 세션 처리 중복

---

## 1. 배경

카카오 로그인 후 OAuth 콜백(`/kakao-authentication/request-access-token-after-redirection`)에서
502 Bad Gateway 오류 발생.

```
CheckKakaoUserRegistrationUseCase.__init__() missing 2 required positional arguments:
'session_store' and 'kakao_token_link'
```

---

## 2. 원인

### 원인 1: UseCase 인스턴스화 시 필수 인자 누락

`kakao_authentication_router.py` line 64-69:

```python
usecase = CheckKakaoUserRegistrationUseCase(
    token_port=_kakao_token_adapter,
    user_info_port=_kakao_token_adapter,
    account_repository=AccountRepositoryImpl(db),
    temp_token_store=_temp_token_store,
    # ❌ session_store, kakao_token_link 미전달
)
```

Router 상단(line 42-43)에 이미 필요한 객체가 정의되어 있음에도 전달하지 않음:

```python
_kakao_session_store = RedisAccountSessionAdapter(redis_client)
_kakao_token_link = RedisKakaoTokenAdapter(redis_client)
```

### 원인 2: UseCase가 이미 처리한 세션/토큰 저장을 Router에서 중복 수행

UseCase `execute()` 내부(line 47-48):
```python
user_token = self._session_store.create_session(account.id)   # 세션 생성
self._kakao_token_link.save(account.id, token.access_token)   # 토큰 저장
```
결과를 `KakaoAccountCheckResponse.user_token`에 담아 반환.

Router(line 74-78)에서 또 수동 호출:
```python
user_token = _kakao_session_store.create(result.account_id)         # ❌ 중복 세션 생성
if result.kakao_access_token:                                         # result.kakao_access_token은 항상 None
    _kakao_token_link.save(result.account_id, result.kakao_access_token)  # ❌ 실질적 미실행
```

---

## 3. 해결 방향

### Fix 1: UseCase에 누락된 인자 전달

```python
usecase = CheckKakaoUserRegistrationUseCase(
    token_port=_kakao_token_adapter,
    user_info_port=_kakao_token_adapter,
    account_repository=AccountRepositoryImpl(db),
    temp_token_store=_temp_token_store,
    session_store=_kakao_session_store,   # ✅ 추가
    kakao_token_link=_kakao_token_link,   # ✅ 추가
)
```

### Fix 2: Router의 중복 세션 처리 제거 → UseCase 결과 사용

```python
if result.is_registered and result.user_token:
    response.set_cookie(key="user_token", value=result.user_token, httponly=True, ...)
    response.set_cookie(key="nickname", value=quote(result.nickname), ...)
    response.set_cookie(key="email", value=quote(result.email), ...)
    response.set_cookie(key="account_id", value=str(result.account_id), ...)
```

---

## 4. Success Criteria

| ID | 기준 |
|----|------|
| SC-1 | 카카오 로그인 콜백 시 502 오류 없이 프론트 콜백 URL로 리다이렉트된다 |
| SC-2 | 기존 회원은 `user_token`, `nickname`, `email`, `account_id` 쿠키가 설정된다 |
| SC-3 | 미가입 회원은 `temp_token`, `kakao_nickname`, `kakao_email` 쿠키가 설정된다 |
| SC-4 | 세션이 중복 생성되지 않는다 |

---

## 5. 변경 파일

| 파일 | 변경 |
|------|------|
| `app/domains/kakao_auth/adapter/inbound/api/kakao_authentication_router.py` | UseCase 인자 추가, Router 중복 세션 처리 제거 |

---

## 6. 완료 정의

- [ ] SC-1 ~ SC-4 통과
- [ ] 백엔드 서버 재시작 후 카카오 로그인 정상 완료 확인

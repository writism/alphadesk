"""쿠키 보안 설정 헬퍼.

모든 인증 쿠키를 일관된 보안 설정으로 세팅한다.
- httponly=True  : JS 접근 차단 (XSS 방어)
- secure=<env>  : HTTPS 전용 (프로덕션)
- samesite=strict: CSRF 방어
"""
from typing import Optional

from fastapi import Response

_SESSION_COOKIE_MAX_AGE = 3600 * 24 * 7  # 7일


def set_auth_cookies(
    response: Response,
    *,
    token_key: str,
    token_value: str,
    secure: bool,
    max_age: int = _SESSION_COOKIE_MAX_AGE,
) -> None:
    """세션/임시 토큰 쿠키를 httponly + strict 로 세팅한다."""
    response.set_cookie(
        key=token_key,
        value=token_value,
        httponly=True,
        secure=secure,
        samesite="strict",
        max_age=max_age,
    )


def set_display_cookies(
    response: Response,
    *,
    nickname: Optional[str],
    email: Optional[str],
    account_id: Optional[int],
    secure: bool,
    max_age: int = _SESSION_COOKIE_MAX_AGE,
) -> None:
    """사용자 표시용 쿠키를 httponly + strict 로 세팅한다.

    닉네임·이메일은 /me 엔드포인트로도 조회 가능하므로 httponly 처리한다.
    account_id 는 서버에서만 참조하면 되므로 httponly 처리한다.
    """
    if nickname is not None:
        response.set_cookie(
            key="nickname",
            value=nickname,
            httponly=True,
            secure=secure,
            samesite="strict",
            max_age=max_age,
        )
    if email is not None:
        response.set_cookie(
            key="email",
            value=email,
            httponly=True,
            secure=secure,
            samesite="strict",
            max_age=max_age,
        )
    if account_id is not None:
        response.set_cookie(
            key="account_id",
            value=str(account_id),
            httponly=True,
            secure=secure,
            samesite="strict",
            max_age=max_age,
        )

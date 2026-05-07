"""일반 사용자 인증 FastAPI 의존성."""
from typing import Optional

from fastapi import Cookie, HTTPException

from app.domains.auth.adapter.outbound.in_memory.redis_session_adapter import RedisSessionAdapter
from app.infrastructure.cache.redis_client import redis_client

_session_adapter = RedisSessionAdapter(redis_client)


def require_user(
    session_token: Optional[str] = Cookie(default=None),
    user_token: Optional[str] = Cookie(default=None),
) -> int:
    """로그인한 사용자만 허용.

    Returns:
        인증된 account_id (int)
    Raises:
        HTTPException 401 — 토큰 없음 또는 세션 만료
    """
    token = session_token or user_token
    if not token:
        raise HTTPException(status_code=401, detail="로그인이 필요합니다.")

    session = _session_adapter.find_by_token(token)
    if not session:
        raise HTTPException(status_code=401, detail="세션이 만료되었습니다.")

    try:
        return int(session.user_id)
    except (ValueError, TypeError):
        raise HTTPException(status_code=401, detail="잘못된 세션입니다.")


def require_user_optional(
    session_token: Optional[str] = Cookie(default=None),
    user_token: Optional[str] = Cookie(default=None),
) -> Optional[int]:
    """로그인 여부 무관하게 허용. 로그인 시 account_id, 비로그인 시 None 반환.

    비로그인 사용자는 전역(공개) 데이터를 조회한다.
    쿠키 account_id 를 직접 신뢰하지 않고 세션에서 검증된 값만 사용한다.
    """
    token = session_token or user_token
    if not token:
        return None

    session = _session_adapter.find_by_token(token)
    if not session:
        return None

    try:
        return int(session.user_id)
    except (ValueError, TypeError):
        return None

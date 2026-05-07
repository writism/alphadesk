"""require_user / require_user_optional 의존성 단위 테스트.

Redis 없이 세션 어댑터를 Fake로 대체하여 인증 로직만 검증한다.
"""
from typing import Optional
from unittest.mock import patch, MagicMock

import pytest
from fastapi import HTTPException

from app.domains.auth.domain.entity.session import Session
from app.domains.auth.domain.value_object.user_role import UserRole


def _make_session(user_id: str = "42") -> Session:
    return Session(token="tok", user_id=user_id, role=UserRole.USER, ttl_seconds=3600)


# ---------------------------------------------------------------------------
# require_user
# ---------------------------------------------------------------------------

def test_세션_토큰_유효하면_account_id_반환():
    session = _make_session("42")
    with patch(
        "app.infrastructure.auth.require_user._session_adapter.find_by_token",
        return_value=session,
    ):
        from app.infrastructure.auth.require_user import require_user
        result = require_user(session_token="tok", user_token=None)
        assert result == 42


def test_쿠키_없으면_401():
    with pytest.raises(HTTPException) as exc_info:
        from app.infrastructure.auth.require_user import require_user
        require_user(session_token=None, user_token=None)
    assert exc_info.value.status_code == 401


def test_세션_만료면_401():
    with patch(
        "app.infrastructure.auth.require_user._session_adapter.find_by_token",
        return_value=None,
    ):
        with pytest.raises(HTTPException) as exc_info:
            from app.infrastructure.auth.require_user import require_user
            require_user(session_token="expired", user_token=None)
        assert exc_info.value.status_code == 401


def test_user_token_쿠키도_허용():
    session = _make_session("99")
    with patch(
        "app.infrastructure.auth.require_user._session_adapter.find_by_token",
        return_value=session,
    ):
        from app.infrastructure.auth.require_user import require_user
        result = require_user(session_token=None, user_token="user-tok")
        assert result == 99


# ---------------------------------------------------------------------------
# require_user_optional
# ---------------------------------------------------------------------------

def test_optional_쿠키_없으면_None():
    from app.infrastructure.auth.require_user import require_user_optional
    result = require_user_optional(session_token=None, user_token=None)
    assert result is None


def test_optional_유효_세션이면_account_id():
    session = _make_session("7")
    with patch(
        "app.infrastructure.auth.require_user._session_adapter.find_by_token",
        return_value=session,
    ):
        from app.infrastructure.auth.require_user import require_user_optional
        result = require_user_optional(session_token="tok", user_token=None)
        assert result == 7


def test_optional_세션_만료면_None():
    with patch(
        "app.infrastructure.auth.require_user._session_adapter.find_by_token",
        return_value=None,
    ):
        from app.infrastructure.auth.require_user import require_user_optional
        result = require_user_optional(session_token="expired", user_token=None)
        assert result is None

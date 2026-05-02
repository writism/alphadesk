"""범용 Redis DB 캐시 유틸리티.

사용 패턴:
    cached = get_cached(redis_client, key)
    if cached is not None:
        return deserialize(cached)
    result = ...expensive DB call...
    set_cached(redis_client, key, result.model_dump(mode='json'), ttl_sec=300)
    return result
"""
from __future__ import annotations

import json
import logging
from typing import Any, Optional

logger = logging.getLogger(__name__)


def get_cached(client, key: str) -> Optional[Any]:
    """캐시 조회. 없거나 오류 시 None 반환."""
    try:
        raw = client.get(key)
        if raw is None:
            return None
        return json.loads(raw)
    except Exception as e:
        logger.debug("[DbCache] get 실패 key=%s: %s", key, type(e).__name__)
        return None


def set_cached(client, key: str, data: Any, ttl_sec: int) -> None:
    """캐시 저장. 오류 시 조용히 무시 (캐시 miss로 처리됨)."""
    try:
        client.setex(key, ttl_sec, json.dumps(data, ensure_ascii=False, default=str))
    except Exception as e:
        logger.debug("[DbCache] set 실패 key=%s: %s", key, type(e).__name__)


def invalidate_cached(client, key: str) -> None:
    """캐시 무효화. 오류 시 조용히 무시."""
    try:
        client.delete(key)
    except Exception as e:
        logger.debug("[DbCache] invalidate 실패 key=%s: %s", key, type(e).__name__)

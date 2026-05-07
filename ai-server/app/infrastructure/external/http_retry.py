"""외부 HTTP 요청 재시도 헬퍼.

429 (Too Many Requests) 응답 시 Retry-After 헤더를 우선 참조하고,
없으면 지수 백오프(exponential backoff)로 재시도한다.
"""
import asyncio
import logging
from typing import Any, Callable, Dict, Optional

import httpx

logger = logging.getLogger(__name__)

_DEFAULT_MAX_RETRIES = 3
_DEFAULT_BACKOFF_BASE = 2.0  # seconds


async def get_with_retry(
    url: str,
    params: Optional[Dict[str, Any]] = None,
    timeout: float = 10.0,
    max_retries: int = _DEFAULT_MAX_RETRIES,
    backoff_base: float = _DEFAULT_BACKOFF_BASE,
    source: str = "HTTP",
) -> httpx.Response:
    """지수 백오프 재시도를 포함한 GET 요청.

    429 응답은 재시도, 그 외 4xx/5xx 는 즉시 raise_for_status().

    Returns:
        httpx.Response (2xx)
    Raises:
        httpx.HTTPStatusError — 재시도 소진 후에도 429, 또는 다른 HTTP 오류
        httpx.HTTPError — 연결/타임아웃 오류 (재시도 없음)
    """
    for attempt in range(1, max_retries + 2):  # attempt 1..max_retries+1
        response = await asyncio.to_thread(httpx.get, url, params=params, timeout=timeout)

        if response.status_code != 429:
            response.raise_for_status()
            return response

        if attempt > max_retries:
            logger.warning("[%s] 429 재시도 한도 초과 (%d회)", source, max_retries)
            response.raise_for_status()  # 최종 실패로 raise

        retry_after = response.headers.get("Retry-After")
        wait = float(retry_after) if retry_after and retry_after.isdigit() else backoff_base ** attempt
        logger.warning("[%s] 429 rate-limit — %.1fs 후 재시도 (%d/%d)", source, wait, attempt, max_retries)
        await asyncio.sleep(wait)

    # unreachable
    raise RuntimeError("get_with_retry: unexpected exit")

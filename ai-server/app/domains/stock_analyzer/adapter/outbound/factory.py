"""ArticleAnalysisRepository 팩토리.

- Redis 가용 시: Redis 어댑터 (TTL 2h, 멀티 워커 공유)
- Redis 불가 시: in-memory 폴백 (단일 프로세스 호환)

프로세스당 한 번만 평가되어 싱글턴으로 공유된다.
"""
from __future__ import annotations

import logging

from app.domains.stock_analyzer.application.usecase.article_analysis_repository_port import ArticleAnalysisRepositoryPort

logger = logging.getLogger(__name__)

_analysis_repository: ArticleAnalysisRepositoryPort | None = None


def _build_repository() -> ArticleAnalysisRepositoryPort:
    try:
        from app.infrastructure.cache.redis_client import redis_client
        from app.infrastructure.config.settings import get_settings

        if get_settings().pipeline_state_redis_enabled:
            redis_client.ping()
            from app.domains.stock_analyzer.adapter.outbound.redis.article_analysis_repository_impl import (
                RedisArticleAnalysisRepository,
            )
            logger.info("[analysis-repo] Redis 어댑터 사용 (TTL 2h)")
            return RedisArticleAnalysisRepository(redis_client)
    except Exception as e:
        logger.warning("[analysis-repo] Redis 연결 실패 → in-memory 폴백: %s", e)

    from app.domains.stock_analyzer.adapter.outbound.in_memory.article_analysis_repository_impl import (
        InMemoryArticleAnalysisRepository,
    )
    logger.info("[analysis-repo] in-memory 어댑터 사용")
    return InMemoryArticleAnalysisRepository()


def get_analysis_repository() -> ArticleAnalysisRepositoryPort:
    global _analysis_repository
    if _analysis_repository is None:
        _analysis_repository = _build_repository()
    return _analysis_repository

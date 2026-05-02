"""ArticleAnalysisRepositoryPort의 Redis 어댑터.

- 키: analysis:{article_id}
- TTL: 기본 2시간 (파이프라인 수행 시간 커버 + 재실행 시 캐시 활용)
- 멀티 워커 환경에서 워커 간 분석 결과 공유 → 중복 LLM 호출 방지
"""
from __future__ import annotations

import json
import logging
from typing import Optional

from app.domains.stock_analyzer.application.usecase.article_analysis_repository_port import ArticleAnalysisRepositoryPort
from app.domains.stock_analyzer.domain.entity.analyzed_article import AnalyzedArticle
from app.domains.stock_analyzer.domain.entity.tag_item import TagItem, TagCategory

logger = logging.getLogger(__name__)

_DEFAULT_TTL_SEC = 60 * 60 * 2  # 2h


def _serialize(analysis: AnalyzedArticle) -> str:
    return json.dumps({
        "article_id": analysis.article_id,
        "summary": analysis.summary,
        "tags": [{"label": t.label, "category": t.category.value} for t in analysis.tags],
        "sentiment": analysis.sentiment,
        "sentiment_score": analysis.sentiment_score,
        "confidence": analysis.confidence,
        "analyzer_version": analysis.analyzer_version,
    })


def _deserialize(raw: str) -> AnalyzedArticle:
    data = json.loads(raw)
    tags = [
        TagItem(label=t["label"], category=TagCategory(t["category"]))
        for t in data.get("tags", [])
    ]
    return AnalyzedArticle(
        article_id=data["article_id"],
        summary=data["summary"],
        tags=tags,
        sentiment=data["sentiment"],
        sentiment_score=data["sentiment_score"],
        confidence=data["confidence"],
        analyzer_version=data["analyzer_version"],
    )


class RedisArticleAnalysisRepository(ArticleAnalysisRepositoryPort):
    def __init__(self, redis_client, ttl_sec: int = _DEFAULT_TTL_SEC) -> None:
        self._redis = redis_client
        self._ttl = ttl_sec

    @staticmethod
    def _key(article_id: str) -> str:
        return f"analysis:{article_id}"

    async def save(self, analysis: AnalyzedArticle) -> AnalyzedArticle:
        try:
            self._redis.set(self._key(analysis.article_id), _serialize(analysis), ex=self._ttl)
        except Exception as e:
            logger.warning("[RedisAnalysisRepo] save 실패: %s", e)
        return analysis

    async def find_by_article_id(self, article_id: str) -> Optional[AnalyzedArticle]:
        try:
            raw = self._redis.get(self._key(article_id))
            if raw:
                return _deserialize(raw)
        except Exception as e:
            logger.warning("[RedisAnalysisRepo] find 실패: %s", e)
        return None

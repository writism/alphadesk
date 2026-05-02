import json
from typing import Optional, Dict, Any

from app.domains.stock_collector.domain.entity.raw_article import RawArticle
from app.domains.stock_collector.infrastructure.orm.raw_article_orm import RawArticleORM


class RawArticleMapper:
    @staticmethod
    def to_entity(orm: RawArticleORM) -> RawArticle:
        meta = None
        if orm.meta_json:
            meta = json.loads(orm.meta_json)

        return RawArticle(
            id=orm.id,
            source_type=orm.source_type,
            source_name=orm.source_name,
            source_doc_id=orm.source_doc_id,
            url=orm.url,
            title=orm.title,
            body_text=orm.body_text,
            published_at=orm.published_at,
            collected_at=orm.collected_at,
            symbol=orm.symbol,
            market=orm.market,
            lang=orm.lang,
            author=orm.author,
            content_hash=orm.content_hash,
            collector_version=orm.collector_version,
            status=orm.status,
            error_code=orm.error_code,
            error_message=orm.error_message,
            meta=meta,
            is_processed=orm.is_processed,
            created_at=orm.created_at,
        )

    @staticmethod
    def to_orm(entity: RawArticle) -> RawArticleORM:
        meta_json = None
        if entity.meta:
            meta_json = json.dumps(entity.meta, ensure_ascii=False)

        return RawArticleORM(
            source_type=entity.source_type,
            source_name=entity.source_name,
            source_doc_id=entity.source_doc_id,
            url=entity.url,
            title=entity.title,
            body_text=entity.body_text,
            published_at=entity.published_at,
            collected_at=entity.collected_at,
            symbol=entity.symbol,
            market=entity.market,
            lang=entity.lang,
            author=entity.author,
            content_hash=entity.content_hash,
            collector_version=entity.collector_version,
            status=entity.status,
            error_code=entity.error_code,
            error_message=entity.error_message,
            meta_json=meta_json,
            is_processed=entity.is_processed,
        )

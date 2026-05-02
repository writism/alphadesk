from typing import Optional, List

from sqlalchemy.orm import Session

from app.domains.stock_collector.application.usecase.raw_article_repository_port import RawArticleRepositoryPort
from app.domains.stock_collector.domain.entity.raw_article import RawArticle
from app.domains.stock_collector.infrastructure.mapper.raw_article_mapper import RawArticleMapper
from app.domains.stock_collector.infrastructure.orm.raw_article_orm import RawArticleORM


class RawArticleRepositoryImpl(RawArticleRepositoryPort):
    def __init__(self, db: Session):
        self._db = db

    def save(self, article: RawArticle) -> RawArticle:
        orm = RawArticleMapper.to_orm(article)
        self._db.add(orm)
        self._db.commit()
        self._db.refresh(orm)
        return RawArticleMapper.to_entity(orm)

    def find_by_dedup_key(self, source_type: str, source_doc_id: str) -> Optional[RawArticle]:
        orm = (
            self._db.query(RawArticleORM)
            .filter(
                RawArticleORM.source_type == source_type,
                RawArticleORM.source_doc_id == source_doc_id,
            )
            .first()
        )
        if orm is None:
            return None
        return RawArticleMapper.to_entity(orm)

    def find_all(self, symbol: Optional[str] = None, source_type: Optional[str] = None) -> List[RawArticle]:
        query = self._db.query(RawArticleORM)
        if symbol:
            query = query.filter(RawArticleORM.symbol == symbol)
        if source_type:
            query = query.filter(RawArticleORM.source_type == source_type)
        query = query.order_by(RawArticleORM.created_at.desc())
        return [RawArticleMapper.to_entity(orm) for orm in query.all()]

    def migrate_symbol(self, old_symbol: str, new_symbol: str) -> int:
        count = (
            self._db.query(RawArticleORM)
            .filter(RawArticleORM.symbol == old_symbol)
            .update({"symbol": new_symbol})
        )
        self._db.commit()
        return count

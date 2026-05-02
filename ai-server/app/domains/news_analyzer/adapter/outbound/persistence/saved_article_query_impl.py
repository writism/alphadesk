from typing import Optional

from sqlalchemy.orm import Session

from app.domains.news_analyzer.application.usecase.saved_article_query_port import SavedArticleQueryPort
from app.domains.news_search.domain.entity.saved_article import SavedArticle
from app.domains.news_search.infrastructure.mapper.saved_article_mapper import SavedArticleMapper
from app.domains.news_search.infrastructure.orm.saved_article_orm import SavedArticleORM


class SavedArticleQueryImpl(SavedArticleQueryPort):
    def __init__(self, db: Session):
        self._db = db

    def find_by_id(self, article_id: int) -> Optional[SavedArticle]:
        orm = self._db.query(SavedArticleORM).filter(SavedArticleORM.id == article_id).first()
        if orm is None:
            return None
        return SavedArticleMapper.to_entity(orm)

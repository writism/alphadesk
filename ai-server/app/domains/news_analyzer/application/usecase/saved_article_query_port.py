from abc import ABC, abstractmethod
from typing import Optional

from app.domains.news_search.domain.entity.saved_article import SavedArticle


class SavedArticleQueryPort(ABC):
    @abstractmethod
    def find_by_id(self, article_id: int) -> Optional[SavedArticle]:
        pass

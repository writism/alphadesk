from typing import Dict, List, Optional

from app.domains.stock_collector.application.usecase.raw_article_repository_port import RawArticleRepositoryPort
from app.domains.stock_collector.domain.entity.raw_article import RawArticle


class FakeRawArticleRepository(RawArticleRepositoryPort):
    """인메모리 기반 RawArticleRepository 테스트 더블."""

    def __init__(self, articles: Optional[List[RawArticle]] = None):
        self._articles: List[RawArticle] = list(articles or [])

    def save(self, article: RawArticle) -> RawArticle:
        self._articles.append(article)
        return article

    def find_by_dedup_key(self, source_type: str, source_doc_id: str) -> Optional[RawArticle]:
        for a in self._articles:
            if a.source_type == source_type and a.source_doc_id == source_doc_id:
                return a
        return None

    def find_all(self, symbol: Optional[str] = None, source_type: Optional[str] = None) -> List[RawArticle]:
        result = self._articles
        if symbol:
            result = [a for a in result if a.symbol == symbol]
        if source_type:
            result = [a for a in result if a.source_type == source_type]
        return list(result)

    def find_all_by_symbols(self, symbols: List[str]) -> Dict[str, List[RawArticle]]:
        result: Dict[str, List[RawArticle]] = {s: [] for s in symbols}
        for article in self._articles:
            if article.symbol in result:
                result[article.symbol].append(article)
        return result

    def migrate_symbol(self, old_symbol: str, new_symbol: str) -> int:
        count = 0
        for article in self._articles:
            if article.symbol == old_symbol:
                article.symbol = new_symbol
                count += 1
        return count

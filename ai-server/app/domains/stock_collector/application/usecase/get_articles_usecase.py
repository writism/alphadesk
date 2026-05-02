from typing import Optional, List

from app.domains.stock_collector.application.usecase.raw_article_repository_port import RawArticleRepositoryPort
from app.domains.stock_collector.application.response.article_response import ArticleResponse


class GetArticlesUseCase:
    def __init__(self, repository: RawArticleRepositoryPort):
        self._repository = repository

    def execute(
        self, symbol: Optional[str] = None, source_type: Optional[str] = None
    ) -> List[ArticleResponse]:
        articles = self._repository.find_all(symbol=symbol, source_type=source_type)

        return [
            ArticleResponse(
                id=article.id,
                source_type=article.source_type,
                source_name=article.source_name,
                source_doc_id=article.source_doc_id,
                url=article.url,
                title=article.title,
                body_text=article.body_text,
                published_at=article.published_at,
                collected_at=article.collected_at,
                symbol=article.symbol,
                market=article.market,
                status=article.status,
                is_processed=article.is_processed,
            )
            for article in articles
        ]

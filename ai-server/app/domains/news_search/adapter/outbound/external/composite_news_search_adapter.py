import asyncio
import logging
from typing import List, Tuple

from app.domains.news_search.application.usecase.news_search_port import NewsSearchPort
from app.domains.news_search.domain.entity.news_article import NewsArticle

logger = logging.getLogger(__name__)


class CompositeNewsSearchAdapter(NewsSearchPort):
    def __init__(self, adapters: List[NewsSearchPort]):
        self._adapters = adapters

    async def search(self, keyword: str, page: int, page_size: int) -> Tuple[List[NewsArticle], int]:
        # 모든 소스를 병렬로 조회
        results = await asyncio.gather(
            *[adapter.search(keyword, 1, 100) for adapter in self._adapters],
            return_exceptions=True,
        )

        all_articles: List[NewsArticle] = []
        seen_links: set = set()

        for i, result in enumerate(results):
            if isinstance(result, Exception):
                logger.warning(
                    "News adapter %s failed: %s",
                    self._adapters[i].__class__.__name__,
                    result,
                )
                continue

            articles, _ = result
            for article in articles:
                link = article.link or ""
                if link and link in seen_links:
                    continue
                if link:
                    seen_links.add(link)
                all_articles.append(article)

        # published_at 기준 최신순 정렬 (없는 경우 뒤로)
        all_articles.sort(key=lambda a: a.published_at or "", reverse=True)

        total = len(all_articles)
        start = (page - 1) * page_size
        paged = all_articles[start: start + page_size]

        return paged, total

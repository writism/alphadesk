import asyncio
import logging
from typing import List, Optional

from app.domains.stock_collector.application.usecase.collector_port import CollectorPort
from app.domains.stock_collector.application.usecase.raw_article_repository_port import RawArticleRepositoryPort
from app.domains.stock_collector.application.response.collect_response import CollectResponse, CollectedItem
from app.domains.stock_collector.domain.entity.raw_article import RawArticle

logger = logging.getLogger(__name__)


class CollectArticlesUseCase:
    def __init__(
        self,
        repository: RawArticleRepositoryPort,
        collectors: List[CollectorPort],
        stock_repository=None,
    ):
        self._repository = repository
        self._collectors = collectors
        self._stock_repository = stock_repository

    async def execute(self, symbol: str) -> CollectResponse:
        # DB에서 종목 정보 조회
        stock_name = symbol
        corp_code = ""

        if self._stock_repository:
            stock = self._stock_repository.find_by_symbol(symbol)
            if stock:
                stock_name = stock.name
                corp_code = stock.corp_code
            else:
                logger.warning(f"[Collector] stocks 테이블에 미등록 심볼: {symbol} — 수집을 건너뜁니다.")
                return CollectResponse(symbol=symbol, total_collected=0, total_skipped=0, items=[])

        # 모든 collector를 병렬로 실행
        all_results: list[List[RawArticle]] = await asyncio.gather(
            *[collector.collect(symbol, stock_name, corp_code) for collector in self._collectors],
            return_exceptions=True,
        )

        collected_items = []
        total_collected = 0
        total_skipped = 0

        for result in all_results:
            if isinstance(result, Exception):
                logger.error(f"[Collector] {symbol} 수집 중 오류: {result}")
                continue

            for article in result:
                existing = self._repository.find_by_dedup_key(
                    article.source_type, article.source_doc_id
                )
                if existing:
                    total_skipped += 1
                    continue

                saved = self._repository.save(article)
                collected_items.append(
                    CollectedItem(
                        id=saved.id,
                        source_type=saved.source_type,
                        source_name=saved.source_name,
                        title=saved.title,
                    )
                )
                total_collected += 1

        return CollectResponse(
            symbol=symbol,
            total_collected=total_collected,
            total_skipped=total_skipped,
            items=collected_items,
        )

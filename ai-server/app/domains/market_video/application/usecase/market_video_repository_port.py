from abc import ABC, abstractmethod
from datetime import datetime
from typing import List, Optional, Tuple

from app.domains.market_video.domain.entity.market_video import MarketVideo


class MarketVideoRepositoryPort(ABC):
    @abstractmethod
    def upsert_all(self, videos: List[MarketVideo]) -> List[MarketVideo]:
        """videoId 기준 upsert. 성공한 영상만 반환한다."""
        pass

    @abstractmethod
    def find_paginated(
        self,
        page: int,
        page_size: int,
        stock_name: Optional[str] = None,
    ) -> Tuple[List[MarketVideo], int]:
        """
        :return: (videos, total_count)
        stock_name이 있으면 title에 포함된 영상만 반환한다.
        """
        pass

    @abstractmethod
    def find_latest_published_at(self, stock_name: str) -> Optional[datetime]:
        """BL-BE-89: stale 판단용 — 해당 종목 영상 중 최신 published_at. 없으면 None."""
        pass

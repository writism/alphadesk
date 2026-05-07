from abc import ABC, abstractmethod
from typing import Dict, Optional, List

from app.domains.stock_collector.domain.entity.raw_article import RawArticle


class RawArticleRepositoryPort(ABC):
    @abstractmethod
    def save(self, article: RawArticle) -> RawArticle:
        pass

    @abstractmethod
    def find_by_dedup_key(self, source_type: str, source_doc_id: str) -> Optional[RawArticle]:
        pass

    @abstractmethod
    def find_all(self, symbol: Optional[str] = None, source_type: Optional[str] = None) -> List[RawArticle]:
        pass

    @abstractmethod
    def find_all_by_symbols(self, symbols: List[str]) -> Dict[str, List[RawArticle]]:
        """여러 종목의 기사를 단일 IN 쿼리로 조회한다. symbol → RawArticle 목록 매핑을 반환한다."""
        pass

    @abstractmethod
    def migrate_symbol(self, old_symbol: str, new_symbol: str) -> int:
        """old_symbol로 저장된 기사들의 symbol을 new_symbol로 일괄 업데이트한다. 변경된 건수를 반환한다."""
        pass

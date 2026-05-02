from collections import Counter
from typing import Dict, List

from app.domains.market_video.domain.service.keyword_synonym_service import KeywordSynonymService


class NounExtractionService:
    """명사 필터링, 동의어 통합, 빈도 집계 — 순수 Python 비즈니스 로직."""

    MIN_NOUN_LENGTH = 2

    def __init__(self) -> None:
        self._synonym_service = KeywordSynonymService()

    def filter_nouns(self, nouns: List[str]) -> List[str]:
        """의미 없는 단어 제거."""
        return [n for n in nouns if len(n) >= self.MIN_NOUN_LENGTH]

    def count_frequencies(self, nouns: List[str], watchlist_stocks: List[str] = []) -> Dict[str, int]:
        """동의어 통합 후 빈도수 내림차순 정렬된 dict 반환.

        watchlist_stocks: 사용자 관심종목 이름 목록 — 정적 테이블에 없는 종목을 동적으로 추가한다.
        """
        self._synonym_service.add_watchlist_stocks(watchlist_stocks)
        raw_counter = Counter(nouns)
        merged = self._synonym_service.merge(raw_counter)
        return dict(merged.most_common())

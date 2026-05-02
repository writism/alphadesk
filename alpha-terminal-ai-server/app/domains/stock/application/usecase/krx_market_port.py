from abc import ABC, abstractmethod
from typing import Dict


class KrxMarketPort(ABC):

    @abstractmethod
    def fetch_market_map(self) -> Dict[str, str]:
        """종목코드 → 시장구분(KOSPI/KOSDAQ/KONEX) 딕셔너리 반환"""
        pass

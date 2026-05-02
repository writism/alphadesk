import logging
import re
from typing import Dict

import httpx

from app.domains.stock.application.usecase.krx_market_port import KrxMarketPort

logger = logging.getLogger(__name__)

_KRX_KIND_URL = "https://kind.krx.co.kr/corpgeneral/corpList.do"
_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    "Referer": "https://kind.krx.co.kr/corpgeneral/corpList.do",
}
_MARKETS = [
    ("stockMkt", "KOSPI"),
    ("kosdaqMkt", "KOSDAQ"),
    ("konexMkt", "KONEX"),
]


class KrxMarketAdapter(KrxMarketPort):

    def fetch_market_map(self) -> Dict[str, str]:
        result: Dict[str, str] = {}

        for market_type, market_label in _MARKETS:
            try:
                codes = self._fetch_codes(market_type)
                for code in codes:
                    result[code] = market_label
                logger.info(f"[KRX] {market_label}: {len(codes)}개 종목코드 수집")
            except Exception as e:
                logger.warning(f"[KRX] {market_label} 수집 실패: {e}")

        logger.info(f"[KRX] 전체 시장구분 매핑 완료: {len(result)}개")
        return result

    def _fetch_codes(self, market_type: str) -> list:
        response = httpx.get(
            _KRX_KIND_URL,
            params={"method": "download", "searchType": "13", "marketType": market_type},
            headers=_HEADERS,
            timeout=15,
            follow_redirects=True,
        )
        response.raise_for_status()
        html = response.content.decode("euc-kr")
        return re.findall(r"mso-number-format[^>]*>(\d{6})<", html)

import logging
import re
import time
from datetime import datetime
from hashlib import sha256
from typing import List

import httpx

from app.domains.stock_collector.application.usecase.collector_port import CollectorPort
from app.domains.stock_collector.domain.entity.raw_article import RawArticle
from app.infrastructure.config.settings import get_settings

logger = logging.getLogger(__name__)

SYMBOL_TO_ENGLISH = {
    "005930": "Samsung Electronics",
    "000660": "SK Hynix",
    "035420": "NAVER",
    "035720": "Kakao",
    "373220": "LG Energy Solution",
    "005380": "Hyundai Motor",
    "000270": "Kia",
    "051910": "LG Chem",
    "006400": "Samsung SDI",
    "068270": "Celltrion",
    "060250": "NHN KCP",
}

_STOCK_CODE_PATTERN = re.compile(r"^\d{6}$|^[A-Z]{1,5}(\.B)?$")


class NewsCollectorAdapter(CollectorPort):
    SERP_API_URL = "https://serpapi.com/search"

    def collect(self, symbol: str, stock_name: str, corp_code: str) -> List[RawArticle]:
        if not _STOCK_CODE_PATTERN.match(symbol):
            logger.warning(f"[NewsCollector] symbol이 코드 형식이 아닙니다: '{symbol}' — 수집을 건너뜁니다.")
            return []

        settings = get_settings()
        korean_keyword = stock_name

        articles = self._fetch(symbol, korean_keyword, settings)

        if not articles:
            english_keyword = SYMBOL_TO_ENGLISH.get(symbol)
            if english_keyword:
                logger.debug(f"[NewsCollector] 한글 검색 결과 없음, 영문 fallback: '{english_keyword}'")
                articles = self._fetch(symbol, english_keyword, settings)

        return articles

    def _fetch(self, symbol: str, keyword: str, settings) -> List[RawArticle]:
        params = {
            "engine": "google_news",
            "q": keyword,
            "api_key": settings.serp_api_key,
            "num": "10",
        }

        try:
            time.sleep(1)
            response = httpx.get(self.SERP_API_URL, params=params, timeout=10.0)
            response.raise_for_status()
            data = response.json()
        except httpx.HTTPError as e:
            logger.warning(f"[NewsCollector] SerpAPI 요청 실패: {e}")
            return []

        articles = []
        now = datetime.now().isoformat()

        for item in data.get("news_results", []):
            link = item.get("link", "")
            title = item.get("title", "")
            snippet = item.get("snippet", "")
            content = f"{title}{snippet}".encode()

            articles.append(
                RawArticle(
                    source_type="NEWS",
                    source_name="GOOGLE_NEWS",
                    source_doc_id=sha256(link.encode()).hexdigest()[:20],
                    url=link,
                    title=title,
                    body_text=snippet,
                    published_at=item.get("date", ""),
                    collected_at=now,
                    symbol=symbol,
                    content_hash=f"sha256:{sha256(content).hexdigest()}",
                    collector_version="collector-v1.0.0",
                    status="COLLECTED",
                    author=item.get("source", {}).get("name", ""),
                    meta={
                        "press": item.get("source", {}).get("name", ""),
                    },
                )
            )

        return articles

import json
import logging

from sqlalchemy.orm import Session

from app.domains.market_analysis.application.usecase.market_data_repository_port import (
    MarketDataRepositoryPort,
    StockThemeData,
    WatchlistStockData,
)
from app.domains.stock_theme.infrastructure.orm.stock_theme_orm import StockThemeORM
from app.domains.watchlist.infrastructure.orm.watchlist_item_orm import WatchlistItemORM

logger = logging.getLogger(__name__)


class MarketDataRepositoryImpl(MarketDataRepositoryPort):
    def __init__(self, db: Session):
        self._db = db

    def get_watchlist(self, account_id: int) -> list[WatchlistStockData]:
        orms = (
            self._db.query(WatchlistItemORM)
            .filter(WatchlistItemORM.account_id == account_id)
            .all()
        )
        return [WatchlistStockData(symbol=o.symbol, name=o.name, market=o.market) for o in orms]

    def get_stock_themes_by_codes(self, codes: list[str]) -> list[StockThemeData]:
        if not codes:
            return []
        orms = (
            self._db.query(StockThemeORM)
            .filter(StockThemeORM.code.in_(codes))
            .all()
        )
        result = []
        for o in orms:
            # BL-BE-82: JSON 컬럼이지만 레거시 데이터에 malformed 문자열이 있을 수 있으므로
            # 파싱 실패 시 빈 목록으로 대체하고 경고 로그 기록
            if isinstance(o.themes, list):
                themes = o.themes
            else:
                try:
                    themes = json.loads(o.themes or "[]")
                except (json.JSONDecodeError, TypeError):
                    logger.warning(
                        "[MarketData] %s 테마 JSON 파싱 실패 — 빈 목록으로 대체 (raw=%r)",
                        o.code, o.themes,
                    )
                    themes = []
            result.append(StockThemeData(code=o.code, themes=themes))
        return result

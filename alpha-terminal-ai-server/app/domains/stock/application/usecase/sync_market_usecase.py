from app.domains.stock.application.usecase.krx_market_port import KrxMarketPort
from app.domains.stock.application.usecase.stock_repository_port import StockRepositoryPort


class SyncMarketUseCase:

    def __init__(self, krx_port: KrxMarketPort, repository: StockRepositoryPort):
        self._krx_port = krx_port
        self._repository = repository

    def execute(self) -> int:
        market_map = self._krx_port.fetch_market_map()
        return self._repository.update_market_bulk(market_map)

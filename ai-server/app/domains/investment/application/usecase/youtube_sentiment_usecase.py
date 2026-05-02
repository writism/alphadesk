from typing import Optional

from app.domains.investment.application.usecase.youtube_sentiment_port import YouTubeSentimentPort


class YouTubeSentimentUseCase:
    """저장된 YouTube 댓글을 기반으로 투자 심리 지표를 산출하는 UseCase."""

    def __init__(self, port: YouTubeSentimentPort) -> None:
        self._port = port

    async def execute(
        self,
        company: Optional[str] = None,
        log_id: Optional[int] = None,
    ) -> dict:
        """감성 지표 산출을 Port에 위임한다.

        Args:
            company: 종목명 (예: "삼성전자")
            log_id : investment_youtube_logs.id (특정 수집 세션)

        Returns:
            YouTubeSentimentMetrics dict
        """
        if company is None and log_id is None:
            raise ValueError("company 또는 log_id 중 하나는 반드시 지정해야 합니다.")
        return await self._port.analyze(company=company, log_id=log_id)

from abc import ABC, abstractmethod
from typing import Optional


class YouTubeSentimentPort(ABC):
    """저장된 YouTube 댓글 감성 지표 산출 Port."""

    @abstractmethod
    async def analyze(
        self,
        company: Optional[str],
        log_id: Optional[int],
    ) -> dict:
        """company 또는 log_id 기준으로 댓글을 조회하고 감성 지표를 반환한다.

        Returns:
            YouTubeSentimentMetrics dict:
            {
                "sentiment_distribution": {"positive": float, "neutral": float, "negative": float},
                "sentiment_score": float,   # -1 ~ +1
                "bullish_keywords": [...],
                "bearish_keywords": [...],
                "topics": [...],
                "volume": int
            }
        Raises:
            ValueError: company, log_id 모두 None인 경우
        """

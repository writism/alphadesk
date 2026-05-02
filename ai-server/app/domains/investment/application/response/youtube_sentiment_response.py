from pydantic import BaseModel


class SentimentDistribution(BaseModel):
    positive: float
    neutral: float
    negative: float


class YouTubeSentimentResponse(BaseModel):
    """YouTube 댓글 기반 투자 심리 지표 응답.

    sentiment_distribution : 긍정/중립/부정 비율 (합계 1.0)
    sentiment_score        : -1(매우부정) ~ +1(매우긍정) 연속값
    bullish_keywords       : 긍정 댓글에서 자주 등장한 투자 키워드 TOP 5
    bearish_keywords       : 부정 댓글에서 자주 등장한 투자 키워드 TOP 5
    topics                 : 전체 댓글의 주요 투자 토픽 TOP 5
    volume                 : 분석 기반 전체 댓글 수
    """

    sentiment_distribution: SentimentDistribution
    sentiment_score: float
    bullish_keywords: list[str]
    bearish_keywords: list[str]
    topics: list[str]
    volume: int

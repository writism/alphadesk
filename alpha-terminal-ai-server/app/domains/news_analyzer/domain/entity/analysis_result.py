from dataclasses import dataclass

from app.domains.news_analyzer.domain.value_object.sentiment import Sentiment


@dataclass
class AnalysisResult:
    keywords: list[str]
    sentiment: Sentiment
    sentiment_score: float

from pydantic import BaseModel


class AnalyzeArticleResponse(BaseModel):
    article_id: int
    keywords: list[str]
    sentiment: str
    sentiment_score: float

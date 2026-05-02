from abc import ABC, abstractmethod

from app.domains.news_analyzer.domain.entity.analysis_result import AnalysisResult


class ArticleAnalysisPort(ABC):
    @abstractmethod
    def analyze(self, content: str) -> AnalysisResult:
        pass

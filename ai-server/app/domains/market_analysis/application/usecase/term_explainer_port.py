from abc import ABC, abstractmethod
from typing import Optional

from app.domains.market_analysis.domain.entity.analysis_answer import AnalysisAnswer


class TermExplainerPort(ABC):
    @abstractmethod
    def explain(self, term: str, context: Optional[str] = None) -> AnalysisAnswer: ...

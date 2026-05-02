from typing import Optional

from app.domains.market_analysis.application.response.explain_term_response import ExplainTermResponse
from app.domains.market_analysis.application.usecase.term_explainer_port import TermExplainerPort


class ExplainTermUseCase:
    def __init__(self, explainer: TermExplainerPort):
        self._explainer = explainer

    def execute(self, term: str, context: Optional[str] = None) -> ExplainTermResponse:
        result = self._explainer.explain(term=term, context=context)
        explanation, example = self._parse(result.answer)
        return ExplainTermResponse(term=term, explanation=explanation, example=example)

    @staticmethod
    def _parse(raw: str) -> tuple[str, str]:
        """LLM 응답에서 설명과 예시를 분리한다."""
        if "예시:" in raw:
            parts = raw.split("예시:", 1)
            return parts[0].strip(), parts[1].strip()
        return raw.strip(), ""

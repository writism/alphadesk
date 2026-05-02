from typing import Optional

from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

from app.domains.market_analysis.application.usecase.term_explainer_port import TermExplainerPort
from app.domains.market_analysis.domain.entity.analysis_answer import AnalysisAnswer

_SYSTEM_PROMPT = """당신은 주식/금융 용어를 쉽게 설명해주는 AI 어시스턴트입니다.

규칙:
- 투자 추천·매수·매도 의견은 절대 제공하지 않습니다.
- 중학생도 이해할 수 있는 쉬운 말로 설명합니다.
- 설명은 3문장 이내로 작성합니다.
- 반드시 아래 형식으로 답변합니다:

[설명 내용]
예시: [실생활 예시 한 문장]

문맥 정보가 주어진 경우 해당 문맥에 맞게 설명합니다."""

_HUMAN_PROMPT = """{context_line}용어: {term}"""


class LangChainTermExplainerAdapter(TermExplainerPort):
    def __init__(self, api_key: str, model: str = "gpt-4o-mini"):
        llm = ChatOpenAI(api_key=api_key, model=model)
        prompt = ChatPromptTemplate.from_messages([
            ("system", _SYSTEM_PROMPT),
            ("human", _HUMAN_PROMPT),
        ])
        self._chain = prompt | llm | StrOutputParser()

    def explain(self, term: str, context: Optional[str] = None) -> AnalysisAnswer:
        context_line = f"문맥: {context}\n" if context else ""
        try:
            answer = self._chain.invoke({"term": term, "context_line": context_line})
            return AnalysisAnswer(answer=answer, in_scope=True)
        except Exception as e:
            return AnalysisAnswer(answer=f"설명 중 오류가 발생했습니다: {e}", in_scope=False)

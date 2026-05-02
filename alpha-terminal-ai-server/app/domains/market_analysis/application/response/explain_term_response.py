from pydantic import BaseModel


class ExplainTermResponse(BaseModel):
    term: str
    explanation: str
    example: str

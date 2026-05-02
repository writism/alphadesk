from typing import Optional

from pydantic import BaseModel


class ExplainTermRequest(BaseModel):
    term: str
    context: Optional[str] = None

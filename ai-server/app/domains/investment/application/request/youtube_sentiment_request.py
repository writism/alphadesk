from typing import Optional

from pydantic import BaseModel, model_validator


class YouTubeSentimentRequest(BaseModel):
    company: Optional[str] = None
    log_id: Optional[int] = None

    @model_validator(mode="after")
    def must_have_one(self) -> "YouTubeSentimentRequest":
        if self.company is None and self.log_id is None:
            raise ValueError("company 또는 log_id 중 하나는 반드시 지정해야 합니다.")
        return self

from typing import Optional

from pydantic import BaseModel


class ArticleResponse(BaseModel):
    id: Optional[int] = None
    source_type: str
    source_name: str
    source_doc_id: str
    url: str
    title: str
    body_text: str
    published_at: str
    collected_at: str
    symbol: str
    market: Optional[str] = None
    status: str
    is_processed: bool

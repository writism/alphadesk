from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional, Dict, Any


@dataclass
class RawArticle:
    source_type: str
    source_name: str
    source_doc_id: str
    url: str
    title: str
    body_text: str
    published_at: str
    collected_at: str
    symbol: str
    content_hash: str
    collector_version: str
    status: str
    id: Optional[int] = None
    market: Optional[str] = None
    lang: str = "ko"
    author: Optional[str] = None
    error_code: Optional[str] = None
    error_message: Optional[str] = None
    meta: Optional[Dict[str, Any]] = None
    is_processed: bool = False
    created_at: datetime = field(default_factory=datetime.now)

    @property
    def dedup_key(self) -> str:
        return f"{self.source_type}:{self.source_doc_id}"

from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class WatchlistItemResponse(BaseModel):
    id: Optional[int] = None
    symbol: str
    name: str
    market: Optional[str] = None
    created_at: datetime

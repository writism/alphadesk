from typing import Optional

from pydantic import BaseModel


class CreateNotificationRequest(BaseModel):
    user_id: int
    title: str
    body: str
    link: Optional[str] = None

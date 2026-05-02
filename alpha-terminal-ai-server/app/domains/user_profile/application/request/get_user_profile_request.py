from pydantic import BaseModel


class GetUserProfileRequest(BaseModel):
    account_id: int

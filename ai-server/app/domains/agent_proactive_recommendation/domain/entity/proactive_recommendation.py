from dataclasses import dataclass


@dataclass
class ProactiveRecommendation:
    account_id: int
    symbol: str
    title: str
    body: str

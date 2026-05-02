from enum import Enum


class CollectStatus(str, Enum):
    COLLECTED = "COLLECTED"
    FAILED = "FAILED"

"""구조화 로깅 설정 — JSON 포맷 + request_id contextvar.

사용:
    configure_logging()  # main.py lifespan 시작 전에 호출

미들웨어가 각 요청 시작 시 request_id_ctx.set(new_id) 를 호출하면
모든 로그에 request_id 필드가 자동으로 포함된다.
"""
from __future__ import annotations

import json
import logging
import traceback
from contextvars import ContextVar
from datetime import datetime, timezone

# 요청별 correlation ID — RequestIDMiddleware 에서 설정
request_id_ctx: ContextVar[str] = ContextVar("request_id", default="-")


class _JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        payload: dict = {
            "ts": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "msg": record.getMessage(),
            "request_id": request_id_ctx.get("-"),
        }
        if record.exc_info:
            payload["exc"] = "".join(traceback.format_exception(*record.exc_info)).strip()
        return json.dumps(payload, ensure_ascii=False)


def configure_logging(level: int = logging.INFO) -> None:
    """루트 로거에 JSON 핸들러를 설정한다. main.py 에서 한 번 호출."""
    root = logging.getLogger()
    if any(isinstance(h, logging.StreamHandler) and isinstance(h.formatter, _JsonFormatter) for h in root.handlers):
        return  # 이미 설정됨

    handler = logging.StreamHandler()
    handler.setFormatter(_JsonFormatter())

    root.handlers.clear()
    root.addHandler(handler)
    root.setLevel(level)

    # uvicorn 액세스 로그는 별도 핸들러 없이 루트를 사용하도록
    for name in ("uvicorn", "uvicorn.error", "uvicorn.access", "fastapi"):
        logging.getLogger(name).handlers = []
        logging.getLogger(name).propagate = True

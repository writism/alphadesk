"""요청별 correlation ID 미들웨어.

- X-Request-ID 헤더가 있으면 그것을 사용 (프록시 전파 지원)
- 없으면 UUID4 를 생성하여 request_id_ctx ContextVar 에 설정
- 응답 헤더에도 X-Request-ID 를 포함시켜 클라이언트에서 추적 가능
"""
from __future__ import annotations

import uuid

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from app.infrastructure.logging_config import request_id_ctx


class RequestIDMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
        token = request_id_ctx.set(request_id)
        try:
            response: Response = await call_next(request)
        finally:
            request_id_ctx.reset(token)
        response.headers["X-Request-ID"] = request_id
        return response

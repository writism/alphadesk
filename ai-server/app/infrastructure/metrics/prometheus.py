"""Prometheus 메트릭 정의 및 /metrics 엔드포인트.

FastAPI 라우터를 반환하므로 main.py 에서 include_router() 로 등록한다.
"""
from fastapi import APIRouter
from fastapi.responses import Response
from prometheus_client import (
    Counter,
    Histogram,
    generate_latest,
    CONTENT_TYPE_LATEST,
)

router = APIRouter(tags=["metrics"])

# ── 메트릭 정의 ──────────────────────────────────────────────────────────────

pipeline_runs_total = Counter(
    "alphadesk_pipeline_runs_total",
    "파이프라인 실행 횟수",
    ["account_type"],  # "user" | "scheduler"
)

pipeline_articles_analyzed_total = Counter(
    "alphadesk_pipeline_articles_analyzed_total",
    "파이프라인에서 AI 분석된 기사 수",
    ["source_type"],  # "NEWS" | "DISCLOSURE" | "REPORT"
)

pipeline_duration_seconds = Histogram(
    "alphadesk_pipeline_duration_seconds",
    "파이프라인 전체 실행 시간 (초)",
    buckets=[5, 15, 30, 60, 120, 300, 600],
)

openai_requests_total = Counter(
    "alphadesk_openai_requests_total",
    "OpenAI API 호출 횟수",
    ["model", "status"],  # status: "success" | "error"
)

collector_requests_total = Counter(
    "alphadesk_collector_requests_total",
    "외부 뉴스/공시 수집기 API 호출 횟수",
    ["source", "status"],  # source: "FINNHUB" | "SERPAPI" | ...
)


# ── /metrics 엔드포인트 ──────────────────────────────────────────────────────

@router.get("/metrics", include_in_schema=False)
async def metrics():
    """Prometheus scrape 엔드포인트 — 운영 모니터링 전용."""
    return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)

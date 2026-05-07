"""_select_articles 함수 — ArticleMode 별 선택 로직 단위 테스트."""
from datetime import datetime, timedelta

from app.domains.pipeline.application.request.run_pipeline_request import ArticleMode
from app.domains.pipeline.application.usecase.run_pipeline_usecase import _select_articles
from app.domains.stock_collector.domain.entity.raw_article import RawArticle


def _make_article(symbol: str, published_at: str) -> RawArticle:
    return RawArticle(
        source_type="NEWS",
        source_name="TEST",
        source_doc_id=published_at,
        url="",
        title=f"제목_{published_at}",
        body_text="",
        published_at=published_at,
        collected_at="",
        symbol=symbol,
        content_hash="",
        collector_version="v1",
        status="COLLECTED",
    )


def _make_articles(count: int = 5) -> list:
    base = datetime(2026, 1, 1)
    return [
        _make_article("005930", (base + timedelta(days=i)).strftime("%Y-%m-%d"))
        for i in range(count)
    ]


def test_LATEST_1_최신_1건만_반환():
    articles = _make_articles(5)
    result = _select_articles(articles, ArticleMode.LATEST_1)
    assert len(result) == 1
    assert result[0].published_at == "2026-01-05"


def test_LATEST_3_최신_3건_반환():
    articles = _make_articles(5)
    result = _select_articles(articles, ArticleMode.LATEST_3)
    assert len(result) == 3
    assert result[0].published_at == "2026-01-05"


def test_LATEST_5_5건_이하이면_전체_반환():
    articles = _make_articles(3)
    result = _select_articles(articles, ArticleMode.LATEST_5)
    assert len(result) == 3


def test_LATEST_5_5건_초과이면_최신_5건만():
    articles = _make_articles(8)
    result = _select_articles(articles, ArticleMode.LATEST_5)
    assert len(result) == 5


def test_빈_기사_목록_반환():
    result = _select_articles([], ArticleMode.LATEST_3)
    assert result == []


def test_LAST_24H_최근_24시간_기사_필터링():
    now = datetime.now()
    recent = _make_article("005930", (now - timedelta(hours=12)).strftime("%Y-%m-%d %H:%M:%S"))
    old = _make_article("005930", (now - timedelta(days=5)).strftime("%Y-%m-%d %H:%M:%S"))
    result = _select_articles([old, recent], ArticleMode.LAST_24H)
    assert len(result) == 1
    assert result[0].published_at == recent.published_at


def test_LAST_24H_해당_없으면_최신_1건_폴백():
    now = datetime.now()
    old1 = _make_article("005930", (now - timedelta(days=10)).strftime("%Y-%m-%d %H:%M:%S"))
    old2 = _make_article("005930", (now - timedelta(days=5)).strftime("%Y-%m-%d %H:%M:%S"))
    result = _select_articles([old1, old2], ArticleMode.LAST_24H)
    assert len(result) == 1
    # 폴백은 최신 1건
    assert result[0].published_at == old2.published_at

"""FakeRawArticleRepository.find_all_by_symbols 단위 테스트.

실제 DB 없이 벌크 조회 로직이 올바르게 동작하는지 검증한다.
"""
from app.domains.stock_collector.domain.entity.raw_article import RawArticle
from tests.fakes.fake_raw_article_repository import FakeRawArticleRepository


def _make(symbol: str, doc_id: str) -> RawArticle:
    return RawArticle(
        source_type="NEWS", source_name="TEST",
        source_doc_id=doc_id, url="", title="T", body_text="",
        published_at="2026-01-01", collected_at="",
        symbol=symbol, content_hash="", collector_version="v1", status="COLLECTED",
    )


def test_단일_심볼_조회():
    repo = FakeRawArticleRepository([_make("005930", "a1"), _make("005930", "a2"), _make("000660", "b1")])
    result = repo.find_all_by_symbols(["005930"])
    assert len(result["005930"]) == 2
    assert "000660" not in result


def test_복수_심볼_일괄_조회():
    repo = FakeRawArticleRepository([
        _make("005930", "a1"),
        _make("000660", "b1"),
        _make("035420", "c1"),
    ])
    result = repo.find_all_by_symbols(["005930", "000660"])
    assert len(result["005930"]) == 1
    assert len(result["000660"]) == 1
    assert "035420" not in result


def test_기사_없는_심볼은_빈_리스트():
    repo = FakeRawArticleRepository([_make("005930", "a1")])
    result = repo.find_all_by_symbols(["005930", "000660"])
    assert result["005930"] == [_make("005930", "a1")]
    assert result["000660"] == []


def test_빈_심볼_목록은_빈_딕셔너리():
    repo = FakeRawArticleRepository([_make("005930", "a1")])
    result = repo.find_all_by_symbols([])
    assert result == {}

import logging
import re
from datetime import datetime, timedelta, timezone
from typing import List, Optional
from urllib.parse import parse_qs, urlparse

from app.domains.market_video.application.response.youtube_video_list_response import (
    YoutubeVideoItem,
    YoutubeVideoListResponse,
)
from app.domains.market_video.application.usecase.collect_market_video_usecase import (
    CollectMarketVideoUseCase,
)
from app.domains.market_video.application.usecase.market_video_repository_port import MarketVideoRepositoryPort
from app.domains.market_video.application.usecase.youtube_channel_video_port import YoutubeChannelVideoPort
from app.domains.market_video.application.usecase.youtube_search_port import YoutubeSearchPort
from app.domains.market_video.domain.entity.market_video import MarketVideo
from app.domains.market_video.domain.entity.youtube_video import YoutubeVideo
from app.infrastructure.config.settings import get_settings

logger = logging.getLogger(__name__)

PAGE_SIZE = 9


class GetYoutubeVideoListUseCase:
    """market_videos DB에서 먼저 조회한다.

    BL-BE-89: 1페이지 조회 시 stale 하거나 데이터가 없으면
    on-demand 수집(언론사 채널 + YouTube 전체 검색)을 먼저 실행한다.
    """

    def __init__(
        self,
        repository: MarketVideoRepositoryPort,
        youtube_search: Optional[YoutubeSearchPort] = None,
        channel_video: Optional[YoutubeChannelVideoPort] = None,
    ):
        self._repository = repository
        self._youtube_search = youtube_search
        self._channel_video = channel_video

    def execute(
        self,
        page_token: Optional[str],
        stock_name: Optional[str] = None,
    ) -> YoutubeVideoListResponse:
        page = int(page_token) if page_token and page_token.isdigit() else 1

        # BL-BE-89: 1페이지 + stock_name 지정 시에만 stale 체크 + on-demand 수집
        if page == 1 and stock_name:
            self._refresh_if_stale(stock_name)

        videos, total = self._repository.find_paginated(
            page=page,
            page_size=PAGE_SIZE,
            stock_name=stock_name,
        )

        # on-demand 수집 후에도 DB 가 비어있고 fallback 어댑터가 있으면 실시간 검색 응답
        if total == 0 and stock_name and self._youtube_search:
            try:
                api_videos, next_token, prev_token, api_total = self._youtube_search.search(
                    page_token=page_token if page_token and not page_token.isdigit() else None,
                    stock_name=stock_name,
                )
                return YoutubeVideoListResponse(
                    items=[
                        YoutubeVideoItem(
                            title=v.title,
                            thumbnail_url=v.thumbnail_url,
                            channel_name=v.channel_name,
                            published_at=v.published_at,
                            video_url=v.video_url,
                        )
                        for v in api_videos
                    ],
                    next_page_token=next_token,
                    prev_page_token=prev_token,
                    total_results=api_total,
                )
            except Exception:
                logger.warning("[get-youtube-list] realtime fallback 실패 — 빈 결과 반환", exc_info=True)

        total_pages = (total + PAGE_SIZE - 1) // PAGE_SIZE
        next_token = str(page + 1) if page < total_pages else None
        prev_token = str(page - 1) if page > 1 else None

        return YoutubeVideoListResponse(
            items=[
                YoutubeVideoItem(
                    title=v.title,
                    thumbnail_url=v.thumbnail_url,
                    channel_name=v.channel_name,
                    published_at=v.published_at.isoformat(),
                    video_url=v.video_url,
                )
                for v in videos
            ],
            next_page_token=next_token,
            prev_page_token=prev_token,
            total_results=total,
        )

    # ── BL-BE-89: on-demand 수집 ────────────────────────────────────────────

    def _refresh_if_stale(self, stock_name: str) -> None:
        """해당 종목 영상이 stale 하거나 비어있으면 수집을 시도한다.

        실패는 모두 로그 경고로 격리. 호출자는 이어서 기존 DB 결과를 조회한다.
        """
        try:
            latest = self._repository.find_latest_published_at(stock_name)
            if latest is not None and not self._is_stale(latest):
                return

            logger.info("[get-youtube-list] %s stale 감지 (latest=%s) — on-demand 수집", stock_name, latest)

            # 1) 언론사 9채널에서 최근 7일 수집
            if self._channel_video is not None:
                try:
                    collect = CollectMarketVideoUseCase(
                        channel_video_port=self._channel_video,
                        repository=self._repository,
                    )
                    collect.execute([stock_name])
                except Exception:
                    logger.warning("[get-youtube-list] 채널 기반 수집 실패 — %s", stock_name, exc_info=True)

            # 2) YouTube 전체 검색 결과도 upsert (롱테일 보강)
            if self._youtube_search is not None:
                try:
                    api_videos, _next, _prev, _total = self._youtube_search.search(
                        page_token=None, stock_name=stock_name,
                    )
                    converted = [self._to_market_video(v) for v in api_videos]
                    converted = [v for v in converted if v is not None]
                    if converted:
                        self._repository.upsert_all(converted)
                except Exception:
                    logger.warning("[get-youtube-list] 검색 기반 수집 실패 — %s", stock_name, exc_info=True)
        except Exception:
            # 어떤 예외도 사용자 조회를 막아서는 안 된다
            logger.exception("[get-youtube-list] on-demand 수집 중 예기치 못한 오류 — %s", stock_name)

    @staticmethod
    def _is_stale(latest: datetime) -> bool:
        stale_hours = get_settings().market_video_stale_hours
        threshold = datetime.now(timezone.utc) - timedelta(hours=stale_hours)
        # DB 의 published_at 은 tz-naive 일 수 있으므로 naive 끼리 비교하도록 맞춘다
        if latest.tzinfo is None:
            threshold = threshold.replace(tzinfo=None)
        return latest < threshold

    @staticmethod
    def _to_market_video(v: YoutubeVideo) -> Optional[MarketVideo]:
        video_id = _extract_video_id(v.video_url)
        if not video_id:
            return None
        try:
            published_at = datetime.fromisoformat(v.published_at.replace("Z", "+00:00"))
        except ValueError:
            published_at = datetime.now(timezone.utc)
        return MarketVideo(
            video_id=video_id,
            title=v.title,
            channel_name=v.channel_name,
            published_at=published_at,
            view_count=0,
            thumbnail_url=v.thumbnail_url,
            video_url=v.video_url,
        )


_YOUTUBE_V_PARAM = re.compile(r"[?&]v=([A-Za-z0-9_-]{6,})")


def _extract_video_id(video_url: str) -> Optional[str]:
    if not video_url:
        return None
    try:
        parsed = urlparse(video_url)
        qs = parse_qs(parsed.query)
        if "v" in qs and qs["v"]:
            return qs["v"][0]
    except Exception:
        pass
    m = _YOUTUBE_V_PARAM.search(video_url)
    return m.group(1) if m else None

"""YouTube 댓글 감성 분석 Outbound Adapter.

DB에서 댓글을 조회(동기 SQLAlchemy → run_in_executor)하고
LLM 기반 감성 분석기(sentiment_analyzer)를 호출하여 지표를 반환한다.
"""
import asyncio
import time
from typing import Optional

from app.domains.investment.application.usecase.youtube_sentiment_port import YouTubeSentimentPort


class YouTubeSentimentAdapter(YouTubeSentimentPort):
    """저장된 YouTube 댓글을 조회하고 감성 지표를 산출하는 Outbound Adapter."""

    async def analyze(
        self,
        company: Optional[str],
        log_id: Optional[int],
    ) -> dict:
        from app.domains.investment.infrastructure.repository.investment_youtube_repository import (
            fetch_comment_texts,
            fetch_video_ids_by_company,
            fetch_video_ids_by_log_id,
        )
        from app.domains.investment.adapter.outbound.agent.sentiment_analyzer import analyze_youtube_comments

        if company is None and log_id is None:
            raise ValueError("company 또는 log_id 중 하나는 반드시 지정해야 합니다.")

        loop = asyncio.get_event_loop()

        # --- 1. video_id 조회 (동기 DB → executor) ---
        t0 = time.perf_counter()
        if log_id is not None:
            video_ids: list[str] = await loop.run_in_executor(
                None, fetch_video_ids_by_log_id, log_id
            )
            label = f"log_id={log_id}"
        else:
            video_ids = await loop.run_in_executor(
                None, fetch_video_ids_by_company, company
            )
            label = f"company={company!r}"

        print(f"[YouTubeSentiment] {label} → video {len(video_ids)}건")

        if not video_ids:
            print(f"[YouTubeSentiment] ⚠ 수집된 영상 없음 → 빈 지표 반환")
            return {
                "sentiment_distribution": {"positive": 0.0, "neutral": 1.0, "negative": 0.0},
                "sentiment_score": 0.0,
                "bullish_keywords": [],
                "bearish_keywords": [],
                "topics": [],
                "volume": 0,
            }

        # --- 2. 댓글 텍스트 조회 (동기 DB → executor) ---
        comment_texts: list[str] = await loop.run_in_executor(
            None, fetch_comment_texts, video_ids
        )
        t_db = time.perf_counter() - t0
        print(f"[YouTubeSentiment] DB 조회 완료 | {len(comment_texts)}건 댓글 | {t_db:.2f}s")

        if not comment_texts:
            print(f"[YouTubeSentiment] ⚠ 저장된 댓글 없음 → 빈 지표 반환")
            return {
                "sentiment_distribution": {"positive": 0.0, "neutral": 1.0, "negative": 0.0},
                "sentiment_score": 0.0,
                "bullish_keywords": [],
                "bearish_keywords": [],
                "topics": [],
                "volume": 0,
            }

        # --- 3. LLM 감성 분석 ---
        t1 = time.perf_counter()
        metrics = await analyze_youtube_comments(comment_texts, company)
        t_llm = time.perf_counter() - t1

        # --- 4. 결과 print (Success Criteria: 지표 확인용) ---
        sd = metrics.get("sentiment_distribution", {})
        print(f"[YouTubeSentiment] ===== 지표 산출 결과 ({label}) =====")
        print(f"[YouTubeSentiment]   분석 댓글 수  : {metrics.get('volume', 0)}건")
        print(f"[YouTubeSentiment]   감성 점수     : {metrics.get('sentiment_score', 0):+.2f}  (-1 부정 ~ +1 긍정)")
        print(f"[YouTubeSentiment]   긍정 비율     : {sd.get('positive', 0):.1%}")
        print(f"[YouTubeSentiment]   중립 비율     : {sd.get('neutral', 0):.1%}")
        print(f"[YouTubeSentiment]   부정 비율     : {sd.get('negative', 0):.1%}")
        print(f"[YouTubeSentiment]   상승 키워드   : {metrics.get('bullish_keywords', [])}")
        print(f"[YouTubeSentiment]   하락 키워드   : {metrics.get('bearish_keywords', [])}")
        print(f"[YouTubeSentiment]   주요 토픽     : {metrics.get('topics', [])}")
        print(f"[YouTubeSentiment]   DB 조회       : {t_db:.2f}s | LLM 분석 : {t_llm:.2f}s | 합계 : {t_db + t_llm:.2f}s")
        print(f"[YouTubeSentiment] =============================================")

        return metrics

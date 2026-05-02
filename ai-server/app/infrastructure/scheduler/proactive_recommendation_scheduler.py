import logging

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

logger = logging.getLogger(__name__)

_scheduler = AsyncIOScheduler()


async def _run_proactive_recommendation():
    from app.domains.agent_proactive_recommendation.application.usecase.run_proactive_recommendation_usecase import (
        RunProactiveRecommendationUseCase,
    )
    from app.domains.market_analysis.adapter.outbound.persistence.market_data_repository_impl import (
        MarketDataRepositoryImpl,
    )
    from app.domains.market_analysis.adapter.outbound.external.langchain_qa_adapter import LangChainQAAdapter
    from app.domains.notification.adapter.outbound.persistence.notification_repository_impl import (
        NotificationRepositoryImpl,
    )
    from app.domains.user_profile.adapter.outbound.persistence.user_profile_repository_impl import (
        UserProfileRepositoryImpl,
    )
    from app.infrastructure.config.settings import get_settings
    from app.infrastructure.database.session import SessionLocal

    logger.info("[ProactiveScheduler] 관심종목 브리핑 배치 시작")
    db = SessionLocal()
    try:
        settings = get_settings()
        usecase = RunProactiveRecommendationUseCase(
            market_repo=MarketDataRepositoryImpl(db),
            profile_repo=UserProfileRepositoryImpl(db),
            notification_repo=NotificationRepositoryImpl(db),
            qa=LangChainQAAdapter(api_key=settings.openai_api_key, model=settings.openai_model),
        )
        sent = usecase.execute()
        logger.info("[ProactiveScheduler] 관심종목 브리핑 배치 완료 — %d명 알림 전송", sent)
    except Exception:
        logger.exception("[ProactiveScheduler] 배치 오류 — 다음 실행에 영향 없음")
    finally:
        db.close()


def start_proactive_recommendation_scheduler():
    _scheduler.add_job(
        _run_proactive_recommendation,
        trigger=CronTrigger(hour=7, minute=0, timezone="Asia/Seoul"),
        id="proactive_recommendation_morning",
        name="07:00 KST 관심종목 브리핑 알림",
        replace_existing=True,
    )
    _scheduler.start()
    logger.info("[ProactiveScheduler] 관심종목 브리핑 스케줄러 시작 — 매일 07:00 KST 실행")


def stop_proactive_recommendation_scheduler():
    if _scheduler.running:
        _scheduler.shutdown()
        logger.info("[ProactiveScheduler] 관심종목 브리핑 스케줄러 종료")

import logging
from datetime import datetime
from zoneinfo import ZoneInfo

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

logger = logging.getLogger(__name__)

_scheduler = AsyncIOScheduler()
_KST = ZoneInfo("Asia/Seoul")


async def _run_briefing_for_hour():
    """매시 정각에 실행 — 현재 KST 시각과 일치하는 briefing_time 을 가진 유저에게 브리핑을 생성하고 알림을 발송한다."""
    from app.domains.notification.adapter.outbound.persistence.notification_repository_impl import NotificationRepositoryImpl
    from app.domains.notification.domain.entity.notification import Notification
    from app.domains.pipeline.adapter.inbound.api.pipeline_router import _build_usecase
    from app.domains.pipeline.adapter.outbound.persistence.analysis_log_repository_impl import AnalysisLogRepositoryImpl
    from app.domains.pipeline.adapter.outbound.state.factory import get_summary_registry
    from app.domains.pipeline.application.request.run_pipeline_request import ArticleMode
    from app.domains.user_profile.adapter.outbound.persistence.user_profile_repository_impl import UserProfileRepositoryImpl
    from app.infrastructure.database.session import SessionLocal

    current_hour = datetime.now(_KST).hour
    logger.info("[BriefingScheduler] KST %02d:00 브리핑 스케줄 실행 시작", current_hour)

    db = SessionLocal()
    try:
        profile_repo = UserProfileRepositoryImpl(db)
        account_ids = profile_repo.find_accounts_by_briefing_time(current_hour)
    finally:
        db.close()

    if not account_ids:
        logger.info("[BriefingScheduler] %02d:00 에 설정된 유저 없음 — 건너뜀", current_hour)
        return

    logger.info("[BriefingScheduler] 브리핑 대상 유저 %d명: %s", len(account_ids), account_ids)

    for account_id in account_ids:
        db = SessionLocal()
        try:
            result = await _build_usecase(db).execute(
                account_id=account_id,
                article_mode=ArticleMode.LATEST_3,
            )
            get_summary_registry().put_all(account_id, result.summaries)
            log_repo = AnalysisLogRepositoryImpl(db)
            log_repo.save_all(result.logs, account_id=account_id)

            processed_count = len([r for r in result.processed if not r.get("skipped")])
            if processed_count == 0:
                logger.info("[BriefingScheduler] account_id=%d 분석된 종목 없음 — 알림 생략", account_id)
                continue

            # 브리핑 알림 생성
            summary_lines = [
                f"· {s.name}({s.symbol}): {s.summary[:40]}…" if len(s.summary) > 40 else f"· {s.name}({s.symbol}): {s.summary}"
                for s in result.summaries[:3]
            ]
            body = "\n".join(summary_lines) if summary_lines else f"{processed_count}개 종목 분석 완료"

            notification = Notification(
                user_id=account_id,
                title=f"관심종목 브리핑 — {datetime.now(_KST).strftime('%m/%d %H:%M')}",
                body=body,
                link="/",
            )
            notif_repo = NotificationRepositoryImpl(db)
            notif_repo.save(notification)
            logger.info("[BriefingScheduler] account_id=%d 브리핑 알림 생성 완료 (%d종목)", account_id, processed_count)

        except Exception:
            logger.exception("[BriefingScheduler] account_id=%d 브리핑 실패 — 다음 실행에 영향 없음", account_id)
            db.rollback()
        finally:
            db.close()


def start_briefing_scheduler():
    _scheduler.add_job(
        _run_briefing_for_hour,
        trigger=CronTrigger(minute=0, timezone="Asia/Seoul"),
        id="briefing_hourly",
        name="매시 정각 — 유저 설정 시각 브리핑",
        replace_existing=True,
    )
    _scheduler.start()
    logger.info("[BriefingScheduler] 브리핑 스케줄러 시작 — 매시 정각 KST 실행")


def stop_briefing_scheduler():
    if _scheduler.running:
        _scheduler.shutdown()
        logger.info("[BriefingScheduler] 브리핑 스케줄러 종료")

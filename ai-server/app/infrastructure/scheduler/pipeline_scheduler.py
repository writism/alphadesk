import logging

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

logger = logging.getLogger(__name__)

_scheduler = AsyncIOScheduler()


def start_scheduler(pipeline_run_func):
    """
    파이프라인 자동 실행 스케줄러 (평일 기준 KST)
    - 07:00 장 시작 전 조기 수집
    - 09:00 장 시작 직전 수집
    - 15:30 장 마감 후 수집
    pipeline_run_func: 실행할 async 함수
    """
    _scheduler.add_job(
        pipeline_run_func,
        trigger=CronTrigger(hour=7, minute=0, timezone="Asia/Seoul"),
        id="pipeline_07",
        name="07:00 KST 장 시작 전 조기 수집",
        replace_existing=True,
    )
    _scheduler.add_job(
        pipeline_run_func,
        trigger=CronTrigger(hour=9, minute=0, timezone="Asia/Seoul"),
        id="pipeline_09",
        name="09:00 KST 장 시작 직전 수집",
        replace_existing=True,
    )
    _scheduler.add_job(
        pipeline_run_func,
        trigger=CronTrigger(hour=15, minute=30, timezone="Asia/Seoul"),
        id="pipeline_1530",
        name="15:30 KST 장 마감 후 수집",
        replace_existing=True,
    )
    _scheduler.start()
    logger.info("[Scheduler] 파이프라인 스케줄러 시작 — 07:00 / 09:00 / 15:30 KST 자동 실행")


def stop_scheduler():
    if _scheduler.running:
        _scheduler.shutdown()
        logger.info("[Scheduler] 스케줄러 종료")

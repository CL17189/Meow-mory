from celery import Celery

from app.core.redis import REDIS_URL

celery_app = Celery("meowmory", broker=REDIS_URL, backend=REDIS_URL)
celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    task_track_started=True,
    timezone="UTC",
    result_expires=3600,
)

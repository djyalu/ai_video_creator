"""
Celery worker configuration for background video processing
"""
from celery import Celery
from .core.config import settings

# Create Celery app
celery_app = Celery(
    "ai_video_creator",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=['app.tasks.video_tasks']
)

# Configure Celery
celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,  # 30 minutes
    task_soft_time_limit=25 * 60,  # 25 minutes
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=1000,
)

# Task routing
celery_app.conf.task_routes = {
    'app.tasks.video_tasks.generate_video_from_prompt': {'queue': 'video_generation'},
    'app.tasks.video_tasks.generate_video_from_image': {'queue': 'video_generation'},
    'app.tasks.video_tasks.check_kling_status': {'queue': 'status_check'},
}

# Autodiscover tasks
celery_app.autodiscover_tasks()

if __name__ == '__main__':
    celery_app.start()
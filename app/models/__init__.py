"""
Database models for the AI Video Creator application
"""

# Import all models here for SQLAlchemy discovery
from .video_job import VideoJob, JobStatus

__all__ = ["VideoJob", "JobStatus"]
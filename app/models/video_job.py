"""
VideoJob database model for tracking video generation jobs
"""
from sqlalchemy import Column, String, DateTime, Text, JSON, Enum as SQLEnum
from sqlalchemy.sql import func
from sqlalchemy.orm import sessionmaker
from datetime import datetime
from enum import Enum
import uuid
from typing import Dict, Any, Optional, ClassVar

from app.database import Base, SessionLocal


class JobStatus(Enum):
    """Job status enumeration"""
    PENDING = "pending"
    PROCESSING = "processing" 
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class VideoJob(Base):
    """
    SQLAlchemy model for video generation jobs
    
    Complete implementation with all CRUD operations
    """
    __tablename__ = "video_jobs"
    
    # Primary key - UUID string
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # User identification
    user_id = Column(String, nullable=False, index=True)
    
    # Job status with enum
    status = Column(SQLEnum(JobStatus), default=JobStatus.PENDING, nullable=False, index=True)
    
    # Input type (text or image)
    input_type = Column(String, nullable=False)
    
    # JSON fields for flexible data storage
    input_data = Column(JSON, nullable=False, default=dict)
    output_data = Column(JSON, nullable=True, default=dict)
    
    # Error message for failed jobs
    error_message = Column(Text, nullable=True)
    
    # Timestamps with auto-update
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Indexing for performance
    __table_args__ = (
        {'mysql_engine': 'InnoDB'},
    )
    
    @classmethod
    async def create(cls, **kwargs) -> 'VideoJob':
        """
        Create new video job with automatic UUID generation
        
        Args:
            **kwargs: Job creation parameters
            
        Returns:
            Created VideoJob instance
        """
        db = SessionLocal()
        try:
            # Generate UUID if not provided
            if 'id' not in kwargs:
                kwargs['id'] = str(uuid.uuid4())
            
            # Create new job instance
            job = cls(**kwargs)
            
            # Add to database
            db.add(job)
            db.commit()
            db.refresh(job)
            
            return job
            
        except Exception as e:
            db.rollback()
            raise e
        finally:
            db.close()
    
    @classmethod
    async def get(cls, job_id: str) -> Optional['VideoJob']:
        """
        Get job by ID
        
        Args:
            job_id: Unique job identifier
            
        Returns:
            VideoJob instance or None if not found
        """
        db = SessionLocal()
        try:
            job = db.query(cls).filter(cls.id == job_id).first()
            if job:
                # Detach from session to avoid lazy loading issues
                db.expunge(job)
            return job
        except Exception as e:
            raise e
        finally:
            db.close()
    
    @classmethod
    async def get_by_user(cls, user_id: str, limit: int = 10, offset: int = 0) -> list['VideoJob']:
        """
        Get jobs by user ID with pagination
        
        Args:
            user_id: User identifier
            limit: Maximum number of results
            offset: Number of results to skip
            
        Returns:
            List of VideoJob instances
        """
        db = SessionLocal()
        try:
            jobs = (
                db.query(cls)
                .filter(cls.user_id == user_id)
                .order_by(cls.created_at.desc())
                .limit(limit)
                .offset(offset)
                .all()
            )
            # Detach from session
            for job in jobs:
                db.expunge(job)
            return jobs
        except Exception as e:
            raise e
        finally:
            db.close()
    
    async def update(self, **kwargs) -> 'VideoJob':
        """
        Update job fields
        
        Args:
            **kwargs: Fields to update
            
        Returns:
            Updated VideoJob instance
        """
        db = SessionLocal()
        try:
            # Get fresh instance from database
            db_job = db.query(VideoJob).filter(VideoJob.id == self.id).first()
            if not db_job:
                raise ValueError(f"Job with ID {self.id} not found")
            
            # Update fields
            for key, value in kwargs.items():
                if hasattr(db_job, key):
                    setattr(db_job, key, value)
                    setattr(self, key, value)  # Update local instance too
            
            # Commit changes
            db.commit()
            db.refresh(db_job)
            
            # Update local instance with fresh data
            for key in ['status', 'output_data', 'error_message', 'updated_at']:
                if hasattr(db_job, key):
                    setattr(self, key, getattr(db_job, key))
            
            return self
            
        except Exception as e:
            db.rollback()
            raise e
        finally:
            db.close()
    
    async def delete(self) -> bool:
        """
        Delete this job from database
        
        Returns:
            True if deleted successfully
        """
        db = SessionLocal()
        try:
            db_job = db.query(VideoJob).filter(VideoJob.id == self.id).first()
            if db_job:
                db.delete(db_job)
                db.commit()
                return True
            return False
        except Exception as e:
            db.rollback()
            raise e
        finally:
            db.close()
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Convert job to dictionary for API responses
        
        Returns:
            Dictionary representation of the job
        """
        return {
            'id': self.id,
            'user_id': self.user_id,
            'status': self.status.value if isinstance(self.status, JobStatus) else self.status,
            'input_type': self.input_type,
            'input_data': self.input_data,
            'output_data': self.output_data,
            'error_message': self.error_message,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def __repr__(self) -> str:
        return f"<VideoJob(id={self.id}, status={self.status}, user_id={self.user_id})>"
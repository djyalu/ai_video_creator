"""
Job status tracking endpoints
"""
from fastapi import APIRouter, HTTPException
from typing import Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

# In-memory job storage (replace with database in production)
job_storage = {}


@router.get("/jobs/{job_id}")
async def get_job_status(job_id: str) -> Dict[str, Any]:
    """
    Get the status of a video generation job
    
    Args:
        job_id: Unique identifier for the job
        
    Returns:
        Job status information
    """
    try:
        # TODO: Replace with database lookup
        if job_id not in job_storage:
            raise HTTPException(status_code=404, detail="Job not found")
        
        job = job_storage[job_id]
        return {
            "job_id": job_id,
            "status": job.get("status", "unknown"),
            "progress": job.get("progress", 0),
            "message": job.get("message", ""),
            "created_at": job.get("created_at"),
            "updated_at": job.get("updated_at"),
            "result": job.get("result")
        }
        
    except Exception as e:
        logger.error(f"Error getting job status for {job_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/jobs")
async def list_jobs(
    user_id: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 10,
    offset: int = 0
) -> Dict[str, Any]:
    """
    List video generation jobs with optional filtering
    
    Args:
        user_id: Filter by user ID
        status: Filter by job status
        limit: Maximum number of results
        offset: Number of results to skip
        
    Returns:
        List of jobs matching the criteria
    """
    try:
        # TODO: Replace with database query
        jobs = []
        for job_id, job_data in job_storage.items():
            if user_id and job_data.get("user_id") != user_id:
                continue
            if status and job_data.get("status") != status:
                continue
            
            jobs.append({
                "job_id": job_id,
                "status": job_data.get("status"),
                "created_at": job_data.get("created_at"),
                "user_id": job_data.get("user_id")
            })
        
        # Apply pagination
        total = len(jobs)
        jobs = jobs[offset:offset + limit]
        
        return {
            "jobs": jobs,
            "total": total,
            "limit": limit,
            "offset": offset
        }
        
    except Exception as e:
        logger.error(f"Error listing jobs: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/jobs/{job_id}")
async def cancel_job(job_id: str) -> Dict[str, Any]:
    """
    Cancel a video generation job
    
    Args:
        job_id: Unique identifier for the job
        
    Returns:
        Cancellation confirmation
    """
    try:
        # TODO: Replace with database update and Celery task cancellation
        if job_id not in job_storage:
            raise HTTPException(status_code=404, detail="Job not found")
        
        job = job_storage[job_id]
        if job.get("status") in ["completed", "failed", "cancelled"]:
            raise HTTPException(
                status_code=400, 
                detail=f"Cannot cancel job with status: {job.get('status')}"
            )
        
        job["status"] = "cancelled"
        job["message"] = "Job cancelled by user request"
        
        return {
            "job_id": job_id,
            "status": "cancelled",
            "message": "Job cancelled successfully"
        }
        
    except Exception as e:
        logger.error(f"Error cancelling job {job_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
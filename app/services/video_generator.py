"""
Video generation service that orchestrates AI services
"""
import asyncio
import logging
from typing import Dict, Optional, Any
from datetime import datetime
import json

from app.core.ai_clients.google_ai import GoogleAIClient
from app.core.ai_clients.kling_ai import KlingAIClient
from app.models.video_job import VideoJob, JobStatus
from app.core.config import settings

logger = logging.getLogger(__name__)


class VideoGenerator:
    """
    Main service for video generation pipeline
    Coordinates between different AI services
    """
    
    def __init__(self):
        self.google_client = GoogleAIClient()
        self.kling_client = KlingAIClient()
        
    async def generate_from_prompt(
        self, 
        prompt: str, 
        user_id: str,
        style_params: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Generate video from text prompt
        
        Args:
            prompt: User's text prompt
            user_id: ID of the requesting user
            style_params: Optional style parameters (duration, aspect_ratio, etc.)
            
        Returns:
            Dict containing job_id and initial status
        """
        # TODO(human): Implement the video generation logic here
        # This should:
        # 1. Enhance the prompt using Google AI
        # 2. Create a database job entry with status 'processing'
        # 3. Call Kling AI to generate the video
        # 4. Handle errors and update job status accordingly
        # 5. Return job information for status tracking
        pass
    
    async def generate_from_image(
        self,
        image_path: str,
        prompt: Optional[str],
        user_id: str,
        motion_params: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Generate video from uploaded image
        
        Args:
            image_path: Path to uploaded image
            prompt: Optional text prompt for context
            user_id: ID of the requesting user
            motion_params: Motion/animation parameters
            
        Returns:
            Dict containing job_id and initial status
        """
        try:
            # Step 1: Analyze image with Google AI
            image_analysis = await self.google_client.analyze_image(image_path)
            
            # Step 2: Generate enhanced prompt
            if prompt:
                combined_prompt = f"{image_analysis['description']}. {prompt}"
            else:
                combined_prompt = image_analysis['description']
            
            enhanced_prompt = await self.google_client.enhance_prompt(
                combined_prompt,
                context="image-to-video"
            )
            
            # Step 3: Create job entry
            job = await VideoJob.create(
                user_id=user_id,
                input_type="image",
                input_data={
                    "image_path": image_path,
                    "original_prompt": prompt,
                    "enhanced_prompt": enhanced_prompt,
                    "motion_params": motion_params
                },
                status=JobStatus.PROCESSING
            )
            
            # Step 4: Generate video with Kling AI
            kling_response = await self.kling_client.image_to_video(
                image_path=image_path,
                prompt=enhanced_prompt,
                motion_params=motion_params
            )
            
            # Step 5: Update job with result
            await job.update(
                status=JobStatus.COMPLETED,
                output_data={
                    "video_url": kling_response["video_url"],
                    "duration": kling_response["duration"],
                    "generated_at": datetime.utcnow().isoformat()
                }
            )
            
            return {
                "job_id": job.id,
                "status": "processing",
                "message": "Video generation started successfully"
            }
            
        except Exception as e:
            logger.error(f"Error in image-to-video generation: {str(e)}")
            if 'job' in locals():
                await job.update(
                    status=JobStatus.FAILED,
                    error_message=str(e)
                )
            raise
    
    async def check_job_status(self, job_id: str) -> Dict[str, Any]:
        """
        Check the status of a video generation job
        
        Args:
            job_id: ID of the job to check
            
        Returns:
            Dict containing current job status and details
        """
        job = await VideoJob.get(job_id)
        if not job:
            return {"error": "Job not found"}
        
        return {
            "job_id": job.id,
            "status": job.status.value,
            "created_at": job.created_at.isoformat(),
            "updated_at": job.updated_at.isoformat(),
            "output": job.output_data if job.status == JobStatus.COMPLETED else None,
            "error": job.error_message if job.status == JobStatus.FAILED else None
        }
    
    async def _handle_kling_polling(self, kling_job_id: str, db_job_id: str):
        """
        Poll Kling AI for video generation status
        
        Args:
            kling_job_id: Kling AI's job ID
            db_job_id: Our database job ID
        """
        max_attempts = 60  # Poll for max 10 minutes
        poll_interval = 10  # Poll every 10 seconds
        
        for attempt in range(max_attempts):
            try:
                status = await self.kling_client.check_status(kling_job_id)
                
                if status["status"] == "completed":
                    job = await VideoJob.get(db_job_id)
                    await job.update(
                        status=JobStatus.COMPLETED,
                        output_data={
                            "video_url": status["video_url"],
                            "duration": status["duration"],
                            "generated_at": datetime.utcnow().isoformat()
                        }
                    )
                    break
                elif status["status"] == "failed":
                    job = await VideoJob.get(db_job_id)
                    await job.update(
                        status=JobStatus.FAILED,
                        error_message=status.get("error", "Unknown error")
                    )
                    break
                    
                await asyncio.sleep(poll_interval)
                
            except Exception as e:
                logger.error(f"Error polling Kling status: {str(e)}")
                if attempt == max_attempts - 1:
                    job = await VideoJob.get(db_job_id)
                    await job.update(
                        status=JobStatus.FAILED,
                        error_message=f"Polling timeout: {str(e)}"
                    )
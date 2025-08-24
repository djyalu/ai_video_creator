"""
Kling AI client for video generation
"""
import httpx
import hashlib
import hmac
import json
import time
import logging
from typing import Dict, Any, Optional
from datetime import datetime
import base64

from app.core.config import settings

logger = logging.getLogger(__name__)


class KlingAIClient:
    """
    Client for Kling AI API
    Handles text-to-video and image-to-video generation
    """
    
    def __init__(self):
        self.access_key = settings.KLING_API_ACCESS_KEY
        self.secret_key = settings.KLING_API_SECRET_KEY
        self.base_url = settings.KLING_API_BASE_URL
        self.client = httpx.AsyncClient(timeout=30.0)
        
    def _generate_signature(self, method: str, path: str, timestamp: str, body: str = "") -> str:
        """
        Generate HMAC signature for Kling AI authentication
        
        Args:
            method: HTTP method (GET, POST, etc.)
            path: API endpoint path
            timestamp: Current timestamp string
            body: Request body as string
            
        Returns:
            Base64 encoded signature
        """
        # Create the string to sign
        string_to_sign = f"{method}\n{path}\n{timestamp}\n{body}"
        
        # Generate HMAC SHA256 signature
        signature = hmac.new(
            self.secret_key.encode('utf-8'),
            string_to_sign.encode('utf-8'),
            hashlib.sha256
        ).digest()
        
        # Return base64 encoded signature
        return base64.b64encode(signature).decode('utf-8')
    
    def _get_headers(self, method: str, path: str, body: Optional[Dict] = None) -> Dict[str, str]:
        """
        Generate request headers with authentication
        
        Args:
            method: HTTP method
            path: API endpoint path
            body: Request body dictionary
            
        Returns:
            Dict of headers
        """
        timestamp = str(int(time.time()))
        body_str = json.dumps(body) if body else ""
        signature = self._generate_signature(method, path, timestamp, body_str)
        
        return {
            "Content-Type": "application/json",
            "X-Access-Key": self.access_key,
            "X-Timestamp": timestamp,
            "X-Signature": signature
        }
    
    async def text_to_video(
        self,
        prompt: str,
        duration: Optional[int] = None,
        aspect_ratio: Optional[str] = None,
        style: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generate video from text prompt
        
        Args:
            prompt: Text description for video generation
            duration: Video duration in seconds (3-10)
            aspect_ratio: Video aspect ratio (16:9, 9:16, 1:1)
            style: Visual style (realistic, anime, cartoon, etc.)
            
        Returns:
            Dict containing job_id and initial response
        """
        try:
            endpoint = "/generate/text-to-video"
            
            # Prepare request body
            body = {
                "prompt": prompt,
                "duration": duration or settings.DEFAULT_VIDEO_DURATION,
                "aspect_ratio": aspect_ratio or settings.DEFAULT_ASPECT_RATIO
            }
            
            if style:
                body["style"] = style
            
            # Get headers with authentication
            headers = self._get_headers("POST", endpoint, body)
            
            # Make API request
            response = await self.client.post(
                f"{self.base_url}{endpoint}",
                headers=headers,
                json=body
            )
            
            response.raise_for_status()
            result = response.json()
            
            logger.info(f"Text-to-video job created: {result.get('job_id')}")
            
            return {
                "job_id": result.get("job_id"),
                "status": "processing",
                "estimated_time": result.get("estimated_time", 120)
            }
            
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error in text-to-video: {e.response.status_code} - {e.response.text}")
            raise Exception(f"Kling AI API error: {e.response.text}")
        except Exception as e:
            logger.error(f"Error in text-to-video generation: {str(e)}")
            raise
    
    async def image_to_video(
        self,
        image_path: str,
        prompt: Optional[str] = None,
        motion_params: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Generate video from image with motion
        
        Args:
            image_path: Path to input image
            prompt: Optional text prompt for motion guidance
            motion_params: Motion parameters (intensity, direction, etc.)
            
        Returns:
            Dict containing job_id and initial response
        """
        try:
            endpoint = "/generate/image-to-video"
            
            # Read and encode image
            with open(image_path, 'rb') as f:
                image_data = base64.b64encode(f.read()).decode('utf-8')
            
            # Prepare request body
            body = {
                "image": image_data,
                "motion_intensity": motion_params.get("intensity", "medium") if motion_params else "medium"
            }
            
            if prompt:
                body["prompt"] = prompt
                
            if motion_params:
                if "direction" in motion_params:
                    body["motion_direction"] = motion_params["direction"]
                if "camera_movement" in motion_params:
                    body["camera_movement"] = motion_params["camera_movement"]
            
            # Get headers with authentication
            headers = self._get_headers("POST", endpoint, body)
            
            # Make API request
            response = await self.client.post(
                f"{self.base_url}{endpoint}",
                headers=headers,
                json=body
            )
            
            response.raise_for_status()
            result = response.json()
            
            logger.info(f"Image-to-video job created: {result.get('job_id')}")
            
            return {
                "job_id": result.get("job_id"),
                "status": "processing",
                "estimated_time": result.get("estimated_time", 90)
            }
            
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error in image-to-video: {e.response.status_code} - {e.response.text}")
            raise Exception(f"Kling AI API error: {e.response.text}")
        except Exception as e:
            logger.error(f"Error in image-to-video generation: {str(e)}")
            raise
    
    async def check_status(self, job_id: str) -> Dict[str, Any]:
        """
        Check the status of a video generation job
        
        Args:
            job_id: Kling AI job ID
            
        Returns:
            Dict containing job status and video URL if completed
        """
        try:
            endpoint = f"/jobs/{job_id}/status"
            
            # Get headers with authentication
            headers = self._get_headers("GET", endpoint)
            
            # Make API request
            response = await self.client.get(
                f"{self.base_url}{endpoint}",
                headers=headers
            )
            
            response.raise_for_status()
            result = response.json()
            
            status_map = {
                "pending": "processing",
                "processing": "processing",
                "completed": "completed",
                "failed": "failed"
            }
            
            return {
                "status": status_map.get(result.get("status"), "processing"),
                "progress": result.get("progress", 0),
                "video_url": result.get("video_url"),
                "duration": result.get("duration"),
                "error": result.get("error_message")
            }
            
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error checking status: {e.response.status_code} - {e.response.text}")
            raise Exception(f"Kling AI API error: {e.response.text}")
        except Exception as e:
            logger.error(f"Error checking job status: {str(e)}")
            raise
    
    async def cancel_job(self, job_id: str) -> bool:
        """
        Cancel a video generation job
        
        Args:
            job_id: Kling AI job ID
            
        Returns:
            True if cancelled successfully
        """
        try:
            endpoint = f"/jobs/{job_id}/cancel"
            
            # Get headers with authentication
            headers = self._get_headers("POST", endpoint)
            
            # Make API request
            response = await self.client.post(
                f"{self.base_url}{endpoint}",
                headers=headers
            )
            
            response.raise_for_status()
            
            logger.info(f"Job {job_id} cancelled successfully")
            return True
            
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error cancelling job: {e.response.status_code} - {e.response.text}")
            return False
        except Exception as e:
            logger.error(f"Error cancelling job: {str(e)}")
            return False
    
    async def __aenter__(self):
        """Async context manager entry"""
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit - close HTTP client"""
        await self.client.aclose()
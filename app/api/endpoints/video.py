"""
Video generation API endpoints
"""
from fastapi import APIRouter, UploadFile, File, HTTPException, Form, Depends, BackgroundTasks
from fastapi.responses import JSONResponse
from typing import Optional, Dict, Any
import aiofiles
import uuid
from pathlib import Path
import logging

from app.services.video_generator import VideoGenerator
from app.core.config import settings
from app.schemas.video import (
    VideoGenerationRequest,
    VideoGenerationResponse,
    VideoFromImageRequest
)

logger = logging.getLogger(__name__)
router = APIRouter()

# Initialize video generator
video_generator = VideoGenerator()


@router.post("/generate/text", response_model=VideoGenerationResponse)
async def generate_video_from_text(
    request: VideoGenerationRequest,
    background_tasks: BackgroundTasks
) -> VideoGenerationResponse:
    """
    Generate video from text prompt
    
    Args:
        request: Video generation request with prompt and parameters
        
    Returns:
        Job information for tracking generation progress
    """
    try:
        # Validate parameters
        if request.duration > settings.MAX_VIDEO_DURATION:
            raise HTTPException(
                status_code=400,
                detail=f"Duration cannot exceed {settings.MAX_VIDEO_DURATION} seconds"
            )
        
        # Create generation job
        result = await video_generator.generate_from_prompt(
            prompt=request.prompt,
            user_id=request.user_id or "anonymous",
            style_params={
                "duration": request.duration,
                "aspect_ratio": request.aspect_ratio,
                "style": request.style,
                "quality": request.quality
            }
        )
        
        return VideoGenerationResponse(
            job_id=result["job_id"],
            status=result["status"],
            message=result.get("message", "Video generation started"),
            estimated_time=result.get("estimated_time", 120)
        )
        
    except Exception as e:
        logger.error(f"Error in text-to-video generation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate/image", response_model=VideoGenerationResponse)
async def generate_video_from_image(
    background_tasks: BackgroundTasks,
    image: UploadFile = File(...),
    prompt: Optional[str] = Form(None),
    duration: int = Form(5),
    motion_intensity: str = Form("medium"),
    camera_movement: str = Form("static"),
    user_id: Optional[str] = Form(None)
) -> VideoGenerationResponse:
    """
    Generate video from uploaded image
    
    Args:
        image: Uploaded image file
        prompt: Optional motion description
        duration: Video duration in seconds
        motion_intensity: Motion intensity (low, medium, high)
        camera_movement: Camera movement type
        user_id: User identifier
        
    Returns:
        Job information for tracking generation progress
    """
    try:
        # Validate file type
        file_ext = Path(image.filename).suffix.lower()
        if file_ext not in settings.ALLOWED_IMAGE_TYPES:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type. Allowed types: {settings.ALLOWED_IMAGE_TYPES}"
            )
        
        # Validate file size
        if image.size > settings.MAX_UPLOAD_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"File size exceeds maximum of {settings.MAX_UPLOAD_SIZE / 1024 / 1024}MB"
            )
        
        # Save uploaded image
        file_id = str(uuid.uuid4())
        file_path = settings.UPLOAD_DIR / f"{file_id}{file_ext}"
        
        async with aiofiles.open(file_path, 'wb') as f:
            content = await image.read()
            await f.write(content)
        
        logger.info(f"Image saved to {file_path}")
        
        # Create generation job
        result = await video_generator.generate_from_image(
            image_path=str(file_path),
            prompt=prompt,
            user_id=user_id or "anonymous",
            motion_params={
                "intensity": motion_intensity,
                "camera": camera_movement,
                "duration": duration
            }
        )
        
        return VideoGenerationResponse(
            job_id=result["job_id"],
            status=result["status"],
            message="Image uploaded and video generation started",
            estimated_time=result.get("estimated_time", 90)
        )
        
    except Exception as e:
        logger.error(f"Error in image-to-video generation: {str(e)}")
        # Clean up uploaded file if it exists
        if 'file_path' in locals() and file_path.exists():
            file_path.unlink()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate/storyboard")
async def generate_storyboard_video(
    script: str = Form(...),
    num_scenes: int = Form(4),
    user_id: Optional[str] = Form(None)
) -> Dict[str, Any]:
    """
    Generate video from storyboard/script
    
    Args:
        script: Video script or description
        num_scenes: Number of scenes to generate
        user_id: User identifier
        
    Returns:
        Storyboard and generation job information
    """
    try:
        # This would use Google AI to create a storyboard
        # Then generate multiple clips and combine them
        # For now, returning a placeholder
        
        return {
            "message": "Storyboard generation is a premium feature",
            "script": script,
            "num_scenes": num_scenes,
            "status": "not_implemented"
        }
        
    except Exception as e:
        logger.error(f"Error in storyboard generation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/styles")
async def get_available_styles() -> Dict[str, Any]:
    """
    Get list of available video generation styles
    
    Returns:
        Available styles and their descriptions
    """
    return {
        "styles": [
            {
                "id": "realistic",
                "name": "Realistic",
                "description": "Photorealistic video generation"
            },
            {
                "id": "anime",
                "name": "Anime",
                "description": "Anime/manga style animation"
            },
            {
                "id": "cartoon",
                "name": "Cartoon",
                "description": "Cartoon-style animation"
            },
            {
                "id": "cinematic",
                "name": "Cinematic",
                "description": "Cinematic with dramatic lighting"
            },
            {
                "id": "artistic",
                "name": "Artistic",
                "description": "Artistic and painterly style"
            },
            {
                "id": "3d",
                "name": "3D Animation",
                "description": "3D rendered animation style"
            }
        ],
        "aspect_ratios": ["16:9", "9:16", "1:1", "4:3", "21:9"],
        "quality_levels": ["standard", "high", "ultra"],
        "motion_intensities": ["low", "medium", "high"],
        "camera_movements": ["static", "pan", "zoom", "rotate", "tracking"]
    }


@router.get("/limits")
async def get_generation_limits() -> Dict[str, Any]:
    """
    Get current generation limits and quotas
    
    Returns:
        Current limits for video generation
    """
    return {
        "max_duration": settings.MAX_VIDEO_DURATION,
        "max_file_size": settings.MAX_UPLOAD_SIZE,
        "allowed_image_types": settings.ALLOWED_IMAGE_TYPES,
        "default_duration": settings.DEFAULT_VIDEO_DURATION,
        "default_aspect_ratio": settings.DEFAULT_ASPECT_RATIO
    }
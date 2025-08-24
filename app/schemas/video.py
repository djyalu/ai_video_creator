"""
Pydantic schemas for video generation
"""
from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


class VideoStyle(str, Enum):
    """Available video generation styles"""
    REALISTIC = "realistic"
    ANIME = "anime"
    CARTOON = "cartoon"
    CINEMATIC = "cinematic"
    ARTISTIC = "artistic"
    THREE_D = "3d"


class AspectRatio(str, Enum):
    """Supported aspect ratios"""
    RATIO_16_9 = "16:9"
    RATIO_9_16 = "9:16"
    RATIO_1_1 = "1:1"
    RATIO_4_3 = "4:3"
    RATIO_21_9 = "21:9"


class QualityLevel(str, Enum):
    """Video quality levels"""
    STANDARD = "standard"
    HIGH = "high"
    ULTRA = "ultra"


class MotionIntensity(str, Enum):
    """Motion intensity levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class CameraMovement(str, Enum):
    """Camera movement types"""
    STATIC = "static"
    PAN = "pan"
    ZOOM = "zoom"
    ROTATE = "rotate"
    TRACKING = "tracking"


class VideoGenerationRequest(BaseModel):
    """Request schema for text-to-video generation"""
    prompt: str = Field(..., min_length=1, max_length=1000, description="Text prompt for video generation")
    duration: int = Field(default=5, ge=3, le=30, description="Video duration in seconds")
    aspect_ratio: AspectRatio = Field(default=AspectRatio.RATIO_16_9, description="Video aspect ratio")
    style: Optional[VideoStyle] = Field(default=None, description="Visual style for generation")
    quality: QualityLevel = Field(default=QualityLevel.HIGH, description="Video quality level")
    user_id: Optional[str] = Field(default=None, description="User identifier")
    
    @validator('prompt')
    def validate_prompt(cls, v):
        """Ensure prompt is not empty or just whitespace"""
        if not v.strip():
            raise ValueError("Prompt cannot be empty")
        return v.strip()


class VideoFromImageRequest(BaseModel):
    """Request schema for image-to-video generation"""
    prompt: Optional[str] = Field(None, max_length=1000, description="Optional motion description")
    duration: int = Field(default=5, ge=3, le=30, description="Video duration in seconds")
    motion_intensity: MotionIntensity = Field(default=MotionIntensity.MEDIUM, description="Motion intensity")
    camera_movement: CameraMovement = Field(default=CameraMovement.STATIC, description="Camera movement type")
    user_id: Optional[str] = Field(default=None, description="User identifier")


class VideoGenerationResponse(BaseModel):
    """Response schema for video generation requests"""
    job_id: str = Field(..., description="Unique job identifier")
    status: str = Field(..., description="Current job status")
    message: str = Field(..., description="Status message")
    estimated_time: Optional[int] = Field(None, description="Estimated completion time in seconds")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Job creation timestamp")


class VideoJobStatus(BaseModel):
    """Schema for video job status"""
    job_id: str = Field(..., description="Unique job identifier")
    status: str = Field(..., description="Current status (pending, processing, completed, failed)")
    progress: Optional[int] = Field(None, ge=0, le=100, description="Progress percentage")
    video_url: Optional[str] = Field(None, description="URL of generated video if completed")
    duration: Optional[float] = Field(None, description="Video duration in seconds")
    created_at: datetime = Field(..., description="Job creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")
    error_message: Optional[str] = Field(None, description="Error message if failed")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Additional metadata")


class StoryboardRequest(BaseModel):
    """Request schema for storyboard generation"""
    script: str = Field(..., min_length=10, max_length=5000, description="Video script or description")
    num_scenes: int = Field(default=4, ge=2, le=10, description="Number of scenes to generate")
    style: Optional[VideoStyle] = Field(default=None, description="Visual style for all scenes")
    transitions: Optional[List[str]] = Field(default=None, description="Transition types between scenes")
    user_id: Optional[str] = Field(default=None, description="User identifier")


class StoryboardScene(BaseModel):
    """Schema for individual storyboard scene"""
    scene_number: int = Field(..., description="Scene number in sequence")
    description: str = Field(..., description="Visual description of the scene")
    duration: int = Field(..., description="Scene duration in seconds")
    camera_angle: Optional[str] = Field(None, description="Camera angle/movement")
    transition: Optional[str] = Field(default="cut", description="Transition to next scene")
    prompt: Optional[str] = Field(None, description="Generated prompt for this scene")


class StoryboardResponse(BaseModel):
    """Response schema for storyboard generation"""
    storyboard_id: str = Field(..., description="Unique storyboard identifier")
    script: str = Field(..., description="Original script")
    num_scenes: int = Field(..., description="Number of scenes")
    scenes: List[StoryboardScene] = Field(..., description="List of scene descriptions")
    total_duration: int = Field(..., description="Total video duration in seconds")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Creation timestamp")


class VideoGalleryItem(BaseModel):
    """Schema for video gallery item"""
    video_id: str = Field(..., description="Unique video identifier")
    job_id: str = Field(..., description="Generation job ID")
    video_url: str = Field(..., description="URL to access the video")
    thumbnail_url: Optional[str] = Field(None, description="Video thumbnail URL")
    prompt: str = Field(..., description="Original generation prompt")
    duration: float = Field(..., description="Video duration in seconds")
    style: Optional[str] = Field(None, description="Generation style used")
    created_at: datetime = Field(..., description="Creation timestamp")
    user_id: Optional[str] = Field(None, description="User who created the video")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Additional metadata")


class VideoGalleryResponse(BaseModel):
    """Response schema for video gallery"""
    videos: List[VideoGalleryItem] = Field(..., description="List of videos")
    total: int = Field(..., description="Total number of videos")
    page: int = Field(default=1, description="Current page")
    per_page: int = Field(default=20, description="Items per page")
    has_more: bool = Field(..., description="Whether more pages exist")
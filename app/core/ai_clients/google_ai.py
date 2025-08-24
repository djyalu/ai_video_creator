"""
Google AI Studio (Gemini) client for prompt enhancement and image analysis
"""
import google.generativeai as genai
from typing import Dict, Any, Optional
import logging
import base64
from pathlib import Path

from app.core.config import settings

logger = logging.getLogger(__name__)


class GoogleAIClient:
    """
    Client for Google AI Studio (Gemini) API
    Handles prompt enhancement and image analysis
    """
    
    def __init__(self):
        # Configure Google AI with API key
        genai.configure(api_key=settings.GOOGLE_AI_API_KEY)
        self.model = genai.GenerativeModel('gemini-pro')
        self.vision_model = genai.GenerativeModel('gemini-pro-vision')
        
    async def enhance_prompt(
        self, 
        prompt: str, 
        context: str = "text-to-video"
    ) -> str:
        """
        Enhance user prompt for better video generation
        
        Args:
            prompt: Original user prompt
            context: Context type (text-to-video, image-to-video)
            
        Returns:
            Enhanced prompt string
        """
        try:
            enhancement_prompt = f"""
            You are a creative director for AI video generation.
            Context: {context}
            
            Original prompt: {prompt}
            
            Enhance this prompt to create a more detailed, cinematic description that will result in a high-quality AI-generated video.
            Include:
            - Visual style and mood
            - Camera movements if relevant
            - Lighting and atmosphere
            - Key actions or transitions
            - Color palette suggestions
            
            Keep it concise but descriptive (max 150 words).
            Return only the enhanced prompt, no explanations.
            """
            
            response = self.model.generate_content(enhancement_prompt)
            enhanced = response.text.strip()
            
            logger.info(f"Enhanced prompt from '{prompt[:50]}...' to '{enhanced[:50]}...'")
            return enhanced
            
        except Exception as e:
            logger.error(f"Error enhancing prompt: {str(e)}")
            # Fallback to original prompt if enhancement fails
            return prompt
    
    async def analyze_image(self, image_path: str) -> Dict[str, Any]:
        """
        Analyze uploaded image to generate context
        
        Args:
            image_path: Path to the image file
            
        Returns:
            Dict containing image analysis results
        """
        try:
            # Load and prepare image
            image_file = Path(image_path)
            if not image_file.exists():
                raise FileNotFoundError(f"Image not found: {image_path}")
            
            # Read image data
            with open(image_path, 'rb') as f:
                image_data = f.read()
            
            # Create image part for Gemini
            image_part = {
                'mime_type': self._get_mime_type(image_path),
                'data': base64.b64encode(image_data).decode()
            }
            
            analysis_prompt = """
            Analyze this image for video generation. Provide:
            1. A detailed description of the scene
            2. Identified objects and subjects
            3. Mood and atmosphere
            4. Suggested motion or animation possibilities
            5. Color palette and lighting
            
            Format as a comprehensive description suitable for video generation.
            """
            
            response = self.vision_model.generate_content([analysis_prompt, image_part])
            
            return {
                "description": response.text.strip(),
                "image_path": image_path,
                "analyzed": True
            }
            
        except Exception as e:
            logger.error(f"Error analyzing image: {str(e)}")
            return {
                "description": "An image to be animated",
                "image_path": image_path,
                "analyzed": False,
                "error": str(e)
            }
    
    async def generate_storyboard(
        self, 
        script: str,
        num_scenes: int = 4
    ) -> Dict[str, Any]:
        """
        Generate storyboard from script for multi-scene videos
        
        Args:
            script: Video script or description
            num_scenes: Number of scenes to generate
            
        Returns:
            Dict containing scene descriptions and prompts
        """
        try:
            storyboard_prompt = f"""
            Create a {num_scenes}-scene storyboard from this script:
            {script}
            
            For each scene provide:
            1. Scene number
            2. Visual description (50 words)
            3. Camera angle/movement
            4. Duration suggestion (seconds)
            5. Transition to next scene
            
            Format as a structured list.
            """
            
            response = self.model.generate_content(storyboard_prompt)
            
            # Parse response into structured format
            scenes = self._parse_storyboard(response.text)
            
            return {
                "script": script,
                "num_scenes": len(scenes),
                "scenes": scenes
            }
            
        except Exception as e:
            logger.error(f"Error generating storyboard: {str(e)}")
            raise
    
    def _get_mime_type(self, file_path: str) -> str:
        """Get MIME type from file extension"""
        ext = Path(file_path).suffix.lower()
        mime_types = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp'
        }
        return mime_types.get(ext, 'image/jpeg')
    
    def _parse_storyboard(self, text: str) -> list:
        """Parse storyboard text into structured format"""
        # Simple parsing logic - can be enhanced with better NLP
        scenes = []
        scene_blocks = text.split("Scene")
        
        for block in scene_blocks[1:]:  # Skip first empty split
            lines = block.strip().split('\n')
            scene = {
                "number": len(scenes) + 1,
                "description": "",
                "camera": "",
                "duration": 3,  # default
                "transition": "cut"
            }
            
            for line in lines:
                line_lower = line.lower()
                if "description" in line_lower or "visual" in line_lower:
                    scene["description"] = line.split(':', 1)[-1].strip()
                elif "camera" in line_lower or "angle" in line_lower:
                    scene["camera"] = line.split(':', 1)[-1].strip()
                elif "duration" in line_lower:
                    try:
                        scene["duration"] = int(''.join(filter(str.isdigit, line)))
                    except:
                        pass
                elif "transition" in line_lower:
                    scene["transition"] = line.split(':', 1)[-1].strip()
            
            scenes.append(scene)
        
        return scenes
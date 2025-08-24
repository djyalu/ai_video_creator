# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an AI Video Creator project - a Python application designed to generate videos using AI technologies. The project is set up with Python 3.13 and uses IntelliJ IDEA as the IDE.

## Project Structure

The main development directory is `/ai_video_creator/` which contains:
- `.venv/` - Python virtual environment (Python 3.13)
- `.idea/` - IntelliJ IDEA configuration files
- `.git/` - Git repository (initialized but no commits yet)

## Development Environment

### Virtual Environment
- Python version: 3.13
- Virtual environment location: `ai_video_creator/.venv/`
- Always activate the virtual environment before working: `source ai_video_creator/.venv/bin/activate` (Linux/Mac) or `ai_video_creator\.venv\Scripts\activate` (Windows)

### Common Commands

```bash
# Activate virtual environment (Linux/WSL)
cd ai_video_creator
source .venv/bin/activate

# Install dependencies (once requirements.txt exists)
pip install -r requirements.txt

# Freeze dependencies
pip freeze > requirements.txt
```

## Architecture Recommendations

Since this is a new AI video creator project, consider implementing these core components:

### Core Modules Structure
- `core/` - Core video generation logic
  - `ai_models/` - AI model integrations (text-to-image, image-to-video, voice synthesis)
  - `video_engine/` - Video composition and rendering
  - `audio_engine/` - Audio processing and synchronization
  
- `api/` - API layer if building a service
  - `endpoints/` - REST API endpoints
  - `schemas/` - Request/response schemas
  
- `utils/` - Utility functions
  - `file_handlers/` - File I/O operations
  - `validators/` - Input validation
  
- `config/` - Configuration management
  - `settings.py` - Application settings
  
- `tests/` - Test suite

### Key Technologies to Consider

For an AI video creator, you'll likely need:
- **Video Processing**: OpenCV, MoviePy, or FFmpeg-python
- **AI Integration**: OpenAI API, Stable Diffusion, or other generative AI APIs
- **Audio Processing**: pydub, librosa
- **Web Framework** (if needed): FastAPI or Flask
- **Task Queue** (for long-running tasks): Celery with Redis

### Git Workflow

The repository is initialized but has no commits. Start with:
```bash
# Create initial commit
git add .
git commit -m "Initial project setup"

# Set up gitignore for Python projects
echo ".venv/
__pycache__/
*.pyc
.env
.idea/workspace.xml
*.mp4
*.avi
output/
temp/" > .gitignore
```

## Important Considerations

1. **API Keys Management**: Store API keys for AI services in environment variables or `.env` file (never commit these)
2. **Resource Management**: Video generation is resource-intensive - implement proper cleanup of temporary files
3. **Async Processing**: Consider async operations for API calls and long-running video generation tasks
4. **Error Handling**: Implement robust error handling for AI API failures and video processing errors
5. **Testing**: Focus on unit tests for core logic and integration tests for AI service interactions

## Project Checkpoints

### Checkpoint 1: Initial Implementation (2024-08-24)
- **Commit**: aedeef4
- **Branch**: main
- **Status**: ✅ Core implementation complete
- **Features Implemented**:
  - Google AI Studio integration for prompt enhancement
  - Kling AI client with HMAC authentication
  - FastAPI REST API with comprehensive endpoints
  - Celery + Redis task queue setup
  - Docker multi-stage build configuration
  - Complete project structure with modular architecture
- **GitHub**: https://github.com/djyalu/ai_video_creator
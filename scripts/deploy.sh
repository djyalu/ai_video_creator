#!/bin/bash

# AI Video Creator - Deployment Script
# This script handles deployment to Render

set -e  # Exit on error

echo "🚀 AI Video Creator Deployment Script"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
SERVICE_NAME="ai-video-creator"
RENDER_URL="https://ai-video-creator-irf1.onrender.com"
BRANCH=${1:-main}

# Function to check prerequisites
check_prerequisites() {
    echo -e "${YELLOW}Checking prerequisites...${NC}"
    
    # Check if git is installed
    if ! command -v git &> /dev/null; then
        echo -e "${RED}Git is not installed!${NC}"
        exit 1
    fi
    
    # Check if we're in a git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        echo -e "${RED}Not in a git repository!${NC}"
        exit 1
    fi
    
    # Check if .env file exists
    if [ ! -f "ai_video_creator/.env" ]; then
        echo -e "${RED}.env file not found!${NC}"
        echo "Please create ai_video_creator/.env with your API keys"
        exit 1
    fi
    
    echo -e "${GREEN}Prerequisites check passed!${NC}"
}

# Function to run tests
run_tests() {
    echo -e "${YELLOW}Running tests...${NC}"
    
    cd ai_video_creator
    
    # Install test dependencies
    pip install pytest pytest-asyncio pytest-cov > /dev/null 2>&1
    
    # Run tests if they exist
    if [ -d "tests" ]; then
        pytest tests/ -v
    else
        echo "No tests found, skipping..."
    fi
    
    cd ..
    echo -e "${GREEN}Tests completed!${NC}"
}

# Function to validate Docker build
validate_docker() {
    echo -e "${YELLOW}Validating Docker build...${NC}"
    
    cd ai_video_creator
    
    # Build Docker image locally
    docker build -t ai-video-creator:test . > /dev/null 2>&1
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}Docker build successful!${NC}"
        
        # Check image size
        SIZE=$(docker inspect ai-video-creator:test --format='{{.Size}}')
        SIZE_MB=$((SIZE / 1024 / 1024))
        echo "Docker image size: ${SIZE_MB} MB"
        
        # Clean up test image
        docker rmi ai-video-creator:test > /dev/null 2>&1
    else
        echo -e "${RED}Docker build failed!${NC}"
        exit 1
    fi
    
    cd ..
}

# Function to deploy to Render
deploy_to_render() {
    echo -e "${YELLOW}Deploying to Render...${NC}"
    
    # Check current branch
    CURRENT_BRANCH=$(git branch --show-current)
    
    if [ "$CURRENT_BRANCH" != "$BRANCH" ]; then
        echo -e "${YELLOW}Switching to $BRANCH branch...${NC}"
        git checkout $BRANCH
    fi
    
    # Pull latest changes
    echo "Pulling latest changes..."
    git pull origin $BRANCH
    
    # Add and commit any changes
    if ! git diff-index --quiet HEAD --; then
        echo "Committing local changes..."
        git add .
        git commit -m "Auto-deploy: $(date +'%Y-%m-%d %H:%M:%S')"
    fi
    
    # Push to GitHub (triggers Render auto-deploy)
    echo -e "${YELLOW}Pushing to GitHub (triggers auto-deploy)...${NC}"
    git push origin $BRANCH
    
    echo -e "${GREEN}Code pushed to GitHub!${NC}"
    echo "Render will automatically deploy from the $BRANCH branch"
}

# Function to monitor deployment
monitor_deployment() {
    echo -e "${YELLOW}Monitoring deployment...${NC}"
    echo "Waiting for deployment to complete (this may take 5-10 minutes)..."
    
    # Wait initial time for deployment to start
    sleep 30
    
    # Check health endpoint
    MAX_ATTEMPTS=20
    ATTEMPT=0
    
    while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
        if curl -f -s "$RENDER_URL/health" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Deployment successful!${NC}"
            echo "Service is live at: $RENDER_URL"
            echo "API Documentation: $RENDER_URL/docs"
            
            # Show service health
            echo -e "\n${YELLOW}Service Health:${NC}"
            curl -s "$RENDER_URL/health" | python -m json.tool
            
            return 0
        fi
        
        ATTEMPT=$((ATTEMPT + 1))
        echo "Checking deployment status... (Attempt $ATTEMPT/$MAX_ATTEMPTS)"
        sleep 30
    done
    
    echo -e "${RED}Deployment monitoring timed out${NC}"
    echo "Please check Render dashboard: https://dashboard.render.com"
    return 1
}

# Function to rollback deployment
rollback() {
    echo -e "${RED}Rolling back deployment...${NC}"
    
    # Get previous commit
    PREV_COMMIT=$(git rev-parse HEAD~1)
    
    echo "Rolling back to commit: $PREV_COMMIT"
    git revert HEAD --no-edit
    git push origin $BRANCH
    
    echo -e "${GREEN}Rollback initiated${NC}"
}

# Main deployment flow
main() {
    echo "Deploying from branch: $BRANCH"
    echo ""
    
    # Step 1: Check prerequisites
    check_prerequisites
    
    # Step 2: Run tests (optional)
    read -p "Run tests before deploying? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        run_tests
    fi
    
    # Step 3: Validate Docker build (optional)
    read -p "Validate Docker build? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if command -v docker &> /dev/null; then
            validate_docker
        else
            echo "Docker not installed, skipping validation..."
        fi
    fi
    
    # Step 4: Deploy to Render
    read -p "Deploy to Render? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        deploy_to_render
        
        # Step 5: Monitor deployment
        monitor_deployment
        
        if [ $? -ne 0 ]; then
            read -p "Deployment failed. Rollback? (y/n) " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                rollback
            fi
        fi
    else
        echo "Deployment cancelled"
    fi
    
    echo ""
    echo "======================================"
    echo "Deployment script completed"
}

# Run main function
main
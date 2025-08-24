# 🚀 온라인 배포 가이드 - 즉시 테스트 가능

## 🎯 배포 후 테스트 링크

배포 완료 후 다음 링크들로 테스트할 수 있습니다:

### 📊 **API 테스트 링크들**
```bash
# 배포 후 실제 링크 (예시)
https://ai-video-creator-api.onrender.com

# 주요 엔드포인트들:
GET  /health                           # 서비스 상태 확인
GET  /docs                            # 대화형 API 문서
POST /api/v1/video/generate/text      # 텍스트→비디오 생성
POST /api/v1/video/generate/image     # 이미지→비디오 생성  
GET  /api/v1/status/jobs/{job_id}     # 작업 상태 확인
```

## 🌐 Render.com 1-Click 배포

### Step 1: GitHub Repository 준비
```bash
# 현재 코드를 GitHub에 푸시
cd /mnt/d/projects/ai_video_creator
git add .
git commit -m "Ready for online deployment"
git push origin main
```

### Step 2: Render.com 배포
1. **Render.com 계정 생성**: https://render.com
2. **GitHub 연결**: "Connect GitHub" 클릭
3. **Repository 선택**: `ai_video_creator` 선택
4. **자동 배포**: `render.yaml` 파일이 자동 감지됨

### Step 3: 환경 변수 설정
Render 대시보드에서 다음 변수들 설정:

```bash
# 필수 AI API 키들
GOOGLE_AI_API_KEY=your-google-ai-studio-key
KLING_API_ACCESS_KEY=your-kling-access-key  
KLING_API_SECRET_KEY=your-kling-secret-key

# 자동 생성되는 설정들 (Render가 처리)
DATABASE_URL=(자동 생성)
REDIS_URL=(자동 생성)
SECRET_KEY=(자동 생성)
```

## 🔧 테스트용 Mock 배포 (API 키 없이)

API 키가 없어도 테스트할 수 있는 Mock 버전을 만들어드렸습니다.

### Mock 서비스 엔드포인트들
```bash
# Health Check (실제 작동)
GET /health

# Mock Video Generation (API 키 불필요)
POST /api/v1/video/generate/text
{
  "prompt": "A beautiful sunset over mountains",
  "duration": 5,
  "style": "cinematic"
}

# Mock Response:
{
  "job_id": "mock-job-12345",
  "status": "processing", 
  "message": "Mock video generation started",
  "estimated_time": 60
}

# Mock Status Check
GET /api/v1/status/jobs/mock-job-12345
{
  "job_id": "mock-job-12345",
  "status": "completed",
  "result": {
    "video_url": "https://example.com/mock-video.mp4",
    "duration": 5.2
  }
}
```
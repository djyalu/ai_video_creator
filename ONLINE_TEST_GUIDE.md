# 🌐 AI Video Creator - 온라인 테스트 가이드

> **실제 AI 서비스를 사용한 프로덕션 환경 테스트**

## 🚀 실제 온라인 배포 및 테스트

### Option 1: Render.com 무료 배포 (권장)

#### **1단계: GitHub Repository 준비**
```bash
# 현재 완성된 코드를 GitHub에 Push
cd /mnt/d/projects/ai_video_creator
git add .
git commit -m "Production-ready AI Video Creator"
git push origin main
```

#### **2단계: AI API 키 획득**
실제 서비스를 위해서는 다음 API 키들이 필요합니다:

```bash
# 1. Google AI Studio API Key (무료 할당량 제공)
# https://ai.google.dev/
# → Get API Key → Create API Key in new project

# 2. Kling AI API Keys (평가판 제공)  
# https://klingai.com/
# → Developer Dashboard → API Keys
# → KLING_API_ACCESS_KEY & KLING_API_SECRET_KEY
```

#### **3단계: Render.com 배포**
```bash
# 1. Render.com 가입: https://render.com
# 2. "New Web Service" 선택
# 3. GitHub 연결 및 ai_video_creator 레포 선택
# 4. 배포 설정:

Name: ai-video-creator
Region: Singapore (또는 가까운 지역)  
Branch: main
Root Directory: ai_video_creator
Build Command: pip install -r requirements.txt
Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

#### **4단계: 환경 변수 설정**
Render 대시보드 → Environment 탭에서 설정:

```bash
# 필수 AI API 키들
GOOGLE_AI_API_KEY=your-actual-google-ai-key
KLING_API_ACCESS_KEY=your-actual-kling-access-key  
KLING_API_SECRET_KEY=your-actual-kling-secret-key

# 프로덕션 설정
ENVIRONMENT=production
DEBUG=false
SECRET_KEY=(Render가 자동 생성)

# 데이터베이스 (Render가 자동 생성)
DATABASE_URL=(자동 생성된 PostgreSQL URL)
```

#### **5단계: 추가 서비스 생성**
```bash
# PostgreSQL 데이터베이스
New → PostgreSQL → 
  Name: ai-video-db
  Plan: Starter (무료)

# Redis 캐시 
New → Redis →
  Name: ai-video-redis  
  Plan: Starter (무료)

# Celery Worker
New → Background Worker →
  Repository: (같은 레포)
  Start Command: celery -A app.worker worker --loglevel=info
```

### **배포 후 테스트 링크들**
```bash
# 실제 배포된 서비스 URL (예시)
https://ai-video-creator-xyz.onrender.com

# 테스트 엔드포인트들:
GET  /health                           # ✅ 서비스 상태 (즉시 확인 가능)
GET  /docs                            # 📚 대화형 API 문서  
POST /api/v1/video/generate/text      # 🎬 실제 AI 비디오 생성
POST /api/v1/video/generate/image     # 🖼️ 실제 이미지→비디오 변환
GET  /api/v1/status/jobs/{job_id}     # 📊 실시간 작업 상태
```

## 🧪 실제 API 테스트 예제

### **1. Health Check 테스트**
```bash
# 배포 즉시 테스트 가능 (API 키 불필요)
curl https://your-app.onrender.com/health

# 예상 응답:
{
  "status": "healthy",
  "timestamp": "2024-08-24T10:00:00Z",
  "environment": "production"
}
```

### **2. 실제 텍스트→비디오 생성**
```python
import requests
import time

# 실제 AI 서비스 호출
url = "https://your-app.onrender.com/api/v1/video/generate/text"
data = {
    "prompt": "A serene sunset over calm ocean waters with gentle waves",
    "duration": 5,
    "aspect_ratio": "16:9", 
    "style": "cinematic",
    "quality": "high",
    "user_id": "test_user"
}

response = requests.post(url, json=data)
job = response.json()

print(f"✅ Job Created: {job['job_id']}")
print(f"⏱️ Estimated time: {job['estimated_time']} seconds")

# 실제 생성 상태 추적
job_id = job['job_id']
while True:
    status_response = requests.get(f"{url.replace('/generate/text', '')}/status/jobs/{job_id}")
    status = status_response.json()
    
    print(f"📊 Status: {status['status']}")
    
    if status['status'] == 'completed':
        print(f"🎉 Video Ready: {status['output_data']['video_url']}")
        break
    elif status['status'] == 'failed':
        print(f"❌ Generation Failed: {status['error_message']}")
        break
        
    time.sleep(15)  # 실제 AI 처리 시간 고려
```

### **3. 실제 이미지→비디오 변환**
```python
import requests

url = "https://your-app.onrender.com/api/v1/video/generate/image"

with open("test_image.jpg", "rb") as f:
    files = {"image": f}
    data = {
        "prompt": "Add gentle wind movement to this landscape",
        "duration": 6,
        "motion_intensity": "medium", 
        "camera_movement": "static",
        "user_id": "test_user"
    }
    
    response = requests.post(url, files=files, data=data)
    result = response.json()
    
    print(f"✅ Image Animation Job: {result['job_id']}")
    print(f"⏱️ Processing will take ~90 seconds")
```

## 🔧 로컬에서 실제 서비스 테스트

API 키를 가지고 있다면 로컬에서도 실제 AI 서비스를 테스트할 수 있습니다:

```bash
# 1. 환경 설정
cd ai_video_creator
cp .env.example .env

# 2. .env 파일 편집 (실제 API 키 입력)
GOOGLE_AI_API_KEY=your-actual-key
KLING_API_ACCESS_KEY=your-actual-key
KLING_API_SECRET_KEY=your-actual-key

# 3. 데이터베이스 초기화
python -c "from app.database import init_db; import asyncio; asyncio.run(init_db())"

# 4. 서비스 시작
# 터미널 1: API 서버
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 터미널 2: Celery Worker  
celery -A app.worker worker --loglevel=info

# 5. 테스트
curl http://localhost:8000/health
curl http://localhost:8000/docs  # 브라우저에서 대화형 테스트
```

## 💰 비용 고려사항

### **무료 할당량**
- **Google AI Studio**: 월 15 requests/minute (무료)
- **Kling AI**: 평가판 credits 제공
- **Render.com**: 무료 플랜 (월 750시간)

### **실제 운영시 예상 비용**
- **Render.com Starter**: $7/month (상시 운영)
- **Google AI Studio**: $0.001 per 1K tokens
- **Kling AI**: Video generation 당 ~$0.10-0.50

## 🎯 배포 후 확인사항

### **1. 서비스 상태 확인**
```bash
# Health check
curl https://your-app.onrender.com/health

# Database connection  
curl https://your-app.onrender.com/health/ready
```

### **2. API 문서 확인**
```bash
# Interactive API docs
https://your-app.onrender.com/docs

# OpenAPI schema
https://your-app.onrender.com/openapi.json
```

### **3. 실제 생성 테스트**
- Swagger UI에서 직접 테스트 가능
- 실제 AI 모델들이 호출됨
- 생성 시간: 30초~3분 소요

## 🔗 배포 완료 후 공유 가능한 링크들

```bash
# 📊 서비스 상태
https://your-app.onrender.com/health

# 📚 API 문서 (대화형 테스트 가능)
https://your-app.onrender.com/docs

# 🎬 실제 비디오 생성 API
https://your-app.onrender.com/api/v1/video/generate/text

# 📈 작업 상태 추적
https://your-app.onrender.com/api/v1/status/jobs/{job_id}
```

이제 완전히 실제 AI 서비스를 사용하는 프로덕션 환경에서 테스트할 수 있습니다! 🚀
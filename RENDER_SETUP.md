# 🚀 Render.com 새 서비스 생성 가이드

## 문제 상황
- 기존 `ai-video-creator-2hio` 서비스가 `x-render-routing: no-server` 에러로 작동 안함
- 새로운 서비스를 생성해서 해결해야 함

## 💡 해결 방법: 새 서비스 생성

### 1단계: Render.com 로그인
1. https://render.com 접속
2. GitHub 계정으로 로그인

### 2단계: 새 Web Service 생성
1. Dashboard에서 "New +" 클릭
2. "Web Service" 선택
3. GitHub repository 연결:
   - Repository: `djyalu/ai_video_creator`
   - Branch: `main`

### 3단계: 서비스 설정
```yaml
Name: ai-video-creator-v2
Environment: Python 3
Build Command: pip install fastapi uvicorn
Start Command: uvicorn main:app --host 0.0.0.0 --port $PORT
```

### 4단계: 환경 변수 설정 (선택사항)
```
ENVIRONMENT=production  
```

### 5단계: 배포 실행
- "Create Web Service" 클릭
- 배포 로그 확인
- 5-10분 대기

## 🧪 테스트 URL
새로 생성된 서비스는 다음 형태의 URL을 가집니다:
- `https://ai-video-creator-v2-xxxx.onrender.com/`
- `https://ai-video-creator-v2-xxxx.onrender.com/health`
- `https://ai-video-creator-v2-xxxx.onrender.com/ping`

## ✅ 성공 확인
```bash
curl https://NEW-SERVICE-URL.onrender.com/
# 예상 응답: {"status":"ok","message":"AI Video Creator is running!"}
```

## 🔄 기존 서비스 문제
기존 `ai-video-creator-2hio` 서비스는:
1. 설정이 복잡하게 얽혀있음  
2. 캐시된 빌드 오류가 있을 수 있음
3. GitHub 연결이 올바르지 않을 수 있음

**해결책**: 새 서비스 생성이 가장 확실한 방법입니다.
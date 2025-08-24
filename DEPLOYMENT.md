# 🚀 AI Video Creator 배포 가이드

## 📦 배포 플랫폼: Render

이 프로젝트는 **Render**에 최적화되어 있습니다. Render는 백그라운드 작업, 영구 스토리지, Redis를 모두 지원합니다.

## 🔧 사전 준비사항

1. **GitHub 저장소**: 코드를 GitHub에 푸시
2. **Render 계정**: [render.com](https://render.com) 가입
3. **API 키 준비**:
   - Google AI Studio API Key
   - Kling AI Access Key & Secret Key

## 📝 Render 배포 단계

### 1️⃣ GitHub 연결
1. Render 대시보드에서 "New +" 클릭
2. "Web Service" 선택
3. GitHub 저장소 연결 및 권한 부여
4. `ai_video_creator` 저장소 선택

### 2️⃣ 서비스 설정
```yaml
Name: ai-video-creator
Region: Singapore (또는 가까운 지역)
Branch: main
Root Directory: ai_video_creator
Runtime: Docker
```

### 3️⃣ 환경 변수 설정
Render 대시보드에서 다음 환경 변수 추가:

```bash
# API Keys (필수)
GOOGLE_AI_API_KEY=your_google_api_key
KLING_API_ACCESS_KEY=your_kling_access_key
KLING_API_SECRET_KEY=your_kling_secret_key

# Security (자동 생성됨)
SECRET_KEY=render가_자동_생성

# Optional
ENVIRONMENT=production
DEBUG=false
```

### 4️⃣ 자동 배포 설정
1. render.yaml 파일이 자동으로 감지됨
2. "Create Web Service" 클릭
3. 첫 배포는 5-10분 소요

## 🐳 로컬 개발 환경 (Docker)

### Docker Compose로 실행
```bash
# 환경 변수 파일 생성 (이미 있음)
cp .env.example .env

# 컨테이너 빌드 및 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f

# 종료
docker-compose down
```

### 서비스 접속
- **API**: http://localhost:8000
- **API 문서**: http://localhost:8000/docs
- **Flower** (Celery 모니터링): http://localhost:5555

## 🌐 다른 플랫폼 배포 옵션

### Koyeb 배포
```bash
# Koyeb CLI 설치
curl -fsSL https://get.koyeb.com/install.sh | sh

# 앱 생성
koyeb app create ai-video-creator

# 서비스 배포
koyeb service create ai-video-api \
  --app ai-video-creator \
  --git github.com/your-username/ai_video_creator \
  --git-branch main \
  --docker \
  --ports 8000:http \
  --env GOOGLE_AI_API_KEY=xxx \
  --env KLING_API_ACCESS_KEY=xxx \
  --env KLING_API_SECRET_KEY=xxx
```

### Railway 배포
```bash
# Railway CLI 설치
npm install -g @railway/cli

# 로그인 및 프로젝트 생성
railway login
railway init

# 배포
railway up

# 환경 변수 설정
railway variables set GOOGLE_AI_API_KEY=xxx
railway variables set KLING_API_ACCESS_KEY=xxx
railway variables set KLING_API_SECRET_KEY=xxx
```

## 📊 모니터링 및 로그

### Render 모니터링
- **Metrics**: CPU, Memory, Disk 사용량 실시간 확인
- **Logs**: 대시보드에서 실시간 로그 스트리밍
- **Alerts**: 서비스 다운 시 이메일 알림

### Health Check 엔드포인트
```bash
# 서비스 상태 확인
curl https://your-app.onrender.com/health

# 응답 예시
{
  "status": "healthy",
  "timestamp": "2024-01-20T10:00:00Z",
  "services": {
    "database": "connected",
    "redis": "connected",
    "google_ai": "ready",
    "kling_ai": "ready"
  }
}
```

## 🔐 보안 고려사항

1. **환경 변수**: API 키는 절대 코드에 하드코딩하지 마세요
2. **HTTPS**: Render는 자동으로 SSL 인증서 제공
3. **Rate Limiting**: API에 rate limiting 구현 권장
4. **백업**: 생성된 비디오는 S3 등 외부 스토리지에 백업

## 🆘 문제 해결

### 빌드 실패
```bash
# requirements.txt 버전 확인
pip freeze > requirements.txt

# Python 버전 확인 (3.13 필요)
python --version
```

### 메모리 부족
- Render 플랜 업그레이드 (Starter → Standard)
- 비디오 처리 배치 크기 축소

### API 연결 실패
- 환경 변수 올바르게 설정되었는지 확인
- API 키 유효성 확인
- 네트워크 방화벽 설정 확인

## 📈 성능 최적화

1. **캐싱**: Redis로 자주 사용되는 프롬프트 캐싱
2. **CDN**: 생성된 비디오를 CloudFlare CDN으로 서빙
3. **Auto-scaling**: Render의 auto-scaling 기능 활용
4. **비동기 처리**: Celery로 모든 비디오 생성 작업 비동기화

## 🎯 프로덕션 체크리스트

- [ ] 환경 변수 모두 설정
- [ ] Health check 엔드포인트 작동 확인
- [ ] 로깅 및 모니터링 설정
- [ ] 백업 전략 수립
- [ ] Rate limiting 구현
- [ ] Error tracking (Sentry 등) 설정
- [ ] 사용자 인증 시스템 구현
- [ ] CORS 설정 확인

## 📞 지원

문제가 있으시면 GitHub Issues에 문의하세요: https://github.com/djyalu/ai_video_creator/issues
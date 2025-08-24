# 🤖 자동 배포 설정 가이드

## 📍 현재 배포 정보
- **Service URL**: https://ai-video-creator-irf1.onrender.com
- **Platform**: Render
- **Repository**: https://github.com/djyalu/ai_video_creator
- **Branch**: main (자동 배포)

## ⚙️ Render 자동 배포 설정

### 1️⃣ Render Dashboard 설정

1. [Render Dashboard](https://dashboard.render.com) 접속
2. **ai-video-creator** 서비스 선택
3. **Settings** 탭으로 이동
4. **Build & Deploy** 섹션에서:
   ```
   Auto-Deploy: Yes ✅
   Branch: main
   Root Directory: ai_video_creator
   ```

### 2️⃣ 환경 변수 설정

Render Dashboard > Environment 탭에서 설정:

```bash
# 필수 API Keys
GOOGLE_AI_API_KEY=***REMOVED***
KLING_API_ACCESS_KEY=***REMOVED***
KLING_API_SECRET_KEY=***REMOVED***

# 자동 생성됨
SECRET_KEY=[Render가 자동 생성]
DATABASE_URL=[Render가 자동 설정]
REDIS_URL=[Render가 자동 설정]
```

### 3️⃣ Deploy Hook 설정 (선택사항)

수동 배포 트리거를 위한 Deploy Hook:

1. Render Dashboard > Settings > Deploy Hook
2. "Generate Deploy Hook" 클릭
3. 생성된 URL을 GitHub Secrets에 저장:
   - Repository Settings > Secrets > Actions
   - Name: `RENDER_DEPLOY_HOOK_URL`
   - Value: 복사한 Deploy Hook URL

## 🚀 자동 배포 프로세스

### Git Push를 통한 자동 배포

```bash
# 1. 변경사항 커밋
git add .
git commit -m "feat: your feature description"

# 2. main 브랜치에 푸시 (자동 배포 트리거)
git push origin main

# 3. 배포 상태 확인 (5-10분 소요)
curl https://ai-video-creator-irf1.onrender.com/health
```

### 배포 스크립트 사용

```bash
# 실행 권한 부여 (최초 1회)
chmod +x scripts/deploy.sh

# 자동 배포 실행
./scripts/deploy.sh

# 특정 브랜치 배포
./scripts/deploy.sh production
```

## 📊 배포 모니터링

### Health Check
```bash
# 서비스 상태 확인
curl https://ai-video-creator-irf1.onrender.com/health

# 예상 응답
{
  "status": "healthy",
  "timestamp": "2024-01-20T10:00:00Z",
  "version": "1.0.0",
  "services": {
    "database": "connected",
    "redis": "connected",
    "google_ai": "ready",
    "kling_ai": "ready"
  }
}
```

### Render Dashboard 모니터링
- **Logs**: 실시간 로그 스트리밍
- **Metrics**: CPU, Memory, Disk 사용량
- **Events**: 배포 이벤트 히스토리
- **Alerts**: 서비스 다운 알림

## 🔄 GitHub Actions CI/CD

### 워크플로우 트리거
- `main` 브랜치 push → 자동 테스트 & 배포
- Pull Request → 테스트만 실행
- Manual trigger → 워크플로우 수동 실행

### GitHub Secrets 설정
Repository Settings > Secrets > Actions:

```yaml
RENDER_API_KEY: ***REMOVED***  # Render API Key
RENDER_DEPLOY_HOOK_URL: https://api.render.com/deploy/srv-xxx  # Deploy Hook
GOOGLE_AI_API_KEY: AIzaSyxxxxx  # For testing
KLING_API_ACCESS_KEY: AJpnxxxxx  # For testing
KLING_API_SECRET_KEY: G8dGxxxxx  # For testing
```

## 🛠️ 로컬 개발 → 프로덕션 배포

### 개발 워크플로우

```bash
# 1. 로컬 개발
cd ai_video_creator
docker-compose up -d

# 2. 테스트
pytest tests/

# 3. 커밋 & 푸시
git add .
git commit -m "feat: new feature"
git push origin feature-branch

# 4. Pull Request 생성
# GitHub에서 PR 생성 → 자동 테스트 실행

# 5. Merge to main
# PR 승인 & merge → 자동 배포
```

## 🔥 빠른 배포 명령어

### 즉시 배포 (긴급 수정)
```bash
git add . && git commit -m "hotfix: urgent fix" && git push origin main
```

### 수동 배포 트리거
```bash
# Deploy Hook 사용
curl -X POST $RENDER_DEPLOY_HOOK_URL

# 또는 GitHub Actions 수동 실행
gh workflow run deploy.yml
```

## 📈 배포 최적화 팁

1. **캐싱 활용**
   - Docker 레이어 캐싱
   - pip 패키지 캐싱
   - 빌드 아티팩트 캐싱

2. **빌드 시간 단축**
   - Multi-stage Docker build
   - 불필요한 파일 .dockerignore에 추가
   - requirements.txt 최적화

3. **Zero-downtime 배포**
   - Health check 설정
   - Rolling deployment
   - Database migration 전략

## 🚨 문제 해결

### 배포 실패 시
1. Render Dashboard > Logs 확인
2. GitHub Actions 로그 확인
3. 롤백: `git revert HEAD && git push`

### 일반적인 문제
- **Build 실패**: requirements.txt 버전 충돌 확인
- **시작 실패**: 환경 변수 누락 확인
- **Health check 실패**: 포트 설정 확인 (10000)

## 📞 지원

- **Render Status**: https://status.render.com
- **GitHub Issues**: https://github.com/djyalu/ai_video_creator/issues
- **Render Support**: https://render.com/support
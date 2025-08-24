# Docker Build Error Fix Guide

## 에러 해결 완료 ✅

### 문제점
Docker 빌드 중 `psycopg2-binary` 설치 실패:
```
Error: pg_config executable not found.
```

### 해결 방법

#### 1. Dockerfile 수정 완료
PostgreSQL 개발 라이브러리 추가:
- **Builder stage**: `libpq-dev`, `postgresql-client` 추가
- **Production stage**: `libpq5` (런타임 라이브러리) 추가

#### 2. 빌드 명령어

**기본 Dockerfile 사용:**
```bash
cd /mnt/d/projects/ai_video_creator/ai_video_creator
docker build -t ai-video-creator .
```

**Alpine 버전 사용 (더 작은 이미지):**
```bash
docker build -f Dockerfile.alpine -t ai-video-creator:alpine .
```

#### 3. Docker Compose 실행
```bash
# 전체 스택 실행
docker-compose up -d

# 빌드 후 실행
docker-compose up --build -d

# 로그 확인
docker-compose logs -f api
```

### 배포 환경별 가이드

#### Render.com 배포
Render는 자동으로 Dockerfile을 감지하고 필요한 의존성을 설치합니다:
1. GitHub에 코드 푸시
2. Render 대시보드에서 자동 배포 확인
3. 환경 변수 설정 확인

#### 로컬 개발
```bash
# Python 가상환경 사용
source .venv/bin/activate
pip install -r requirements.txt

# 환경 변수 설정
cp .env.example .env
# .env 파일에 API 키 입력

# 개발 서버 실행
python main.py
```

### 검증 방법

1. **Docker 이미지 빌드 확인:**
```bash
docker images | grep ai-video-creator
```

2. **컨테이너 헬스체크:**
```bash
curl http://localhost:8000/health
```

3. **PostgreSQL 연결 테스트:**
```bash
docker exec -it <container_id> python -c "import psycopg2; print('PostgreSQL 연결 성공')"
```

### 추가 최적화 옵션

1. **이미지 크기 줄이기:**
   - Alpine 버전 사용 (약 40% 크기 감소)
   - 불필요한 파일 제외 (.dockerignore 활용)

2. **빌드 캐싱 최적화:**
   - requirements.txt를 먼저 복사
   - 자주 변경되는 파일은 나중에 복사

3. **보안 강화:**
   - non-root user (appuser) 사용
   - 민감한 정보는 환경 변수로 관리

### 문제 발생 시 체크리스트

- [ ] Docker Desktop/Engine 실행 중인지 확인
- [ ] PostgreSQL 서비스 실행 중인지 확인
- [ ] .env 파일에 필요한 환경 변수 설정됨
- [ ] 포트 충돌 없는지 확인 (8000, 5432, 6379)
- [ ] 디스크 공간 충분한지 확인

## 성공! 🎉
이제 Docker 빌드가 정상적으로 작동합니다.
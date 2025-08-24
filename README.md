# AI Video Creator

Google AI Studio와 Kling AI를 활용한 AI 비디오 생성 서비스

## 🚀 주요 기능

- **텍스트 → 비디오**: 프롬프트를 입력하여 AI 비디오 생성
- **이미지 → 비디오**: 이미지를 업로드하고 모션을 추가하여 비디오 생성
- **프롬프트 향상**: Google AI를 활용한 프롬프트 개선
- **다양한 스타일**: Realistic, Anime, Cartoon, Cinematic 등
- **실시간 진행상황**: WebSocket을 통한 실시간 상태 업데이트

## 📋 필수 요구사항

- Python 3.13+
- Redis (Celery 작업 큐)
- PostgreSQL 또는 SQLite
- Google AI Studio API Key
- Kling AI API Keys

## 🔧 설치 방법

### 1. 저장소 클론
```bash
cd ai_video_creator
```

### 2. 가상 환경 설정
```bash
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
# 또는
.venv\Scripts\activate  # Windows
```

### 3. 의존성 설치
```bash
pip install -r requirements.txt
```

### 4. 환경 변수 설정
```bash
cp .env.example .env
```

`.env` 파일을 편집하여 API 키 입력:
```env
GOOGLE_AI_API_KEY=your-google-ai-api-key
KLING_API_ACCESS_KEY=your-kling-access-key
KLING_API_SECRET_KEY=your-kling-secret-key
SECRET_KEY=your-secret-key-here
```

### 5. 데이터베이스 초기화
```bash
python -c "from app.database import init_db; import asyncio; asyncio.run(init_db())"
```

## 🏃‍♂️ 실행 방법

### 개발 환경

#### 1. Redis 시작
```bash
redis-server
```

#### 2. Celery Worker 시작
```bash
celery -A app.tasks.celery_app worker --loglevel=info
```

#### 3. FastAPI 서버 시작
```bash
python main.py
# 또는
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### 4. (선택) Flower 모니터링
```bash
celery -A app.tasks.celery_app flower
```

### Docker 환경

```bash
# 모든 서비스 시작
docker-compose up -d

# 로그 확인
docker-compose logs -f

# 서비스 중지
docker-compose down
```

## 📚 API 문서

서버 실행 후 다음 URL에서 확인:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 🎨 API 사용 예제

### 텍스트로 비디오 생성
```python
import requests

url = "http://localhost:8000/api/v1/video/generate/text"
data = {
    "prompt": "A beautiful sunset over the ocean with waves",
    "duration": 5,
    "aspect_ratio": "16:9",
    "style": "cinematic",
    "quality": "high"
}

response = requests.post(url, json=data)
job_id = response.json()["job_id"]
```

### 이미지로 비디오 생성
```python
import requests

url = "http://localhost:8000/api/v1/video/generate/image"
files = {"image": open("sunset.jpg", "rb")}
data = {
    "prompt": "Add gentle wave motion and birds flying",
    "duration": 5,
    "motion_intensity": "medium",
    "camera_movement": "pan"
}

response = requests.post(url, files=files, data=data)
job_id = response.json()["job_id"]
```

### 작업 상태 확인
```python
url = f"http://localhost:8000/api/v1/status/{job_id}"
response = requests.get(url)
status = response.json()
```

## 🏗️ 프로젝트 구조

```
ai_video_creator/
├── app/
│   ├── api/               # API 엔드포인트
│   ├── core/              # 핵심 설정 및 AI 클라이언트
│   ├── models/            # 데이터베이스 모델
│   ├── schemas/           # Pydantic 스키마
│   ├── services/          # 비즈니스 로직
│   └── tasks/             # Celery 비동기 작업
├── uploads/               # 업로드된 이미지
├── outputs/               # 생성된 비디오
├── tests/                 # 테스트 코드
├── main.py               # FastAPI 앱 진입점
├── requirements.txt       # Python 의존성
├── docker-compose.yml     # Docker 설정
└── .env                  # 환경 변수
```

## 🔑 환경 변수 설명

| 변수명 | 설명 | 예시 |
|--------|------|------|
| `GOOGLE_AI_API_KEY` | Google AI Studio API 키 | `AIza...` |
| `KLING_API_ACCESS_KEY` | Kling AI 액세스 키 | `ak_...` |
| `KLING_API_SECRET_KEY` | Kling AI 시크릿 키 | `sk_...` |
| `DATABASE_URL` | 데이터베이스 연결 URL | `postgresql://user:pass@localhost/db` |
| `REDIS_URL` | Redis 연결 URL | `redis://localhost:6379/0` |
| `SECRET_KEY` | JWT 서명용 시크릿 키 | 랜덤 문자열 |

## 🧪 테스트

```bash
# 모든 테스트 실행
pytest

# 커버리지 포함
pytest --cov=app --cov-report=html
```

## 📝 개발 노트

### 추가 구현 필요 사항

1. **인증/인가**: JWT 기반 사용자 인증
2. **결제 시스템**: 크레딧 기반 사용량 제한
3. **관리자 대시보드**: 사용 통계 및 모니터링
4. **비디오 편집**: 생성된 비디오 후처리 기능
5. **배치 처리**: 여러 비디오 동시 생성

### 성능 최적화

- Redis 캐싱으로 반복 요청 최적화
- 비디오 스트리밍 구현
- CDN 통합으로 비디오 전송 개선
- 워커 스케일링 자동화

## 🤝 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이센스

MIT License - 자세한 내용은 [LICENSE](LICENSE) 파일 참조

## 💬 문의

문제가 있거나 제안사항이 있으면 GitHub Issues를 통해 알려주세요.
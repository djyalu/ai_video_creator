# Multi-stage build for optimized image size
FROM python:3.12-slim as builder

# Set working directory
WORKDIR /app

# Install system dependencies for video processing and PostgreSQL
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    python3-dev \
    build-essential \
    ffmpeg \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    wget \
    libpq-dev \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies with better compatibility
# Step 1: Upgrade pip and install build tools
RUN python -m pip install --no-cache-dir --upgrade pip

# Step 2: Install core build dependencies separately to avoid conflicts
RUN pip install --no-cache-dir "setuptools>=65.0.0" "wheel>=0.37.0" "packaging>=21.0"

# Step 3: Install requirements with retry mechanism
RUN pip install --no-cache-dir --timeout=300 -r requirements.txt || \
    (pip install --no-cache-dir --force-reinstall --no-deps setuptools && \
     pip install --no-cache-dir -r requirements.txt)

# Verify critical dependencies are installed
RUN python -c "import psycopg2; import redis; import celery; print('✓ All critical dependencies installed')"

# Production stage
FROM python:3.12-slim

WORKDIR /app

# Install runtime dependencies only
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

# Copy Python packages from builder
COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p uploads outputs temp logs

# Create non-root user for security
RUN useradd -m -u 1000 appuser && \
    chown -R appuser:appuser /app

USER appuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD python -c "import httpx; httpx.get('http://localhost:8000/health')" || exit 1

# Start the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
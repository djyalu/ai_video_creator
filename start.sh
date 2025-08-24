#!/bin/bash

# AI Video Creator Production Startup Script

echo "🚀 Starting AI Video Creator in Production Mode"

# Check environment variables (optional for startup)
if [ -z "$GOOGLE_AI_API_KEY" ]; then
    echo "⚠️ GOOGLE_AI_API_KEY is not set - AI features will be limited"
else
    echo "✅ GOOGLE_AI_API_KEY is configured"
fi

if [ -z "$KLING_API_ACCESS_KEY" ]; then
    echo "⚠️ KLING_API_ACCESS_KEY is not set - AI features will be limited"
else
    echo "✅ KLING_API_ACCESS_KEY is configured"
fi

if [ -z "$KLING_API_SECRET_KEY" ]; then
    echo "⚠️ KLING_API_SECRET_KEY is not set - AI features will be limited"
else
    echo "✅ KLING_API_SECRET_KEY is configured"
fi

echo "🚀 Starting with available configuration"

# Initialize database
echo "📊 Initializing database..."
python -c "
import asyncio
from app.database import init_db

async def setup():
    try:
        await init_db()
        print('✅ Database initialization completed')
    except Exception as e:
        print(f'❌ Database initialization failed: {e}')
        exit(1)

asyncio.run(setup())
"

# Check database connection
if [ $? -eq 0 ]; then
    echo "✅ Database is ready"
else
    echo "⚠️ Database initialization failed, but continuing startup..."
fi

# Start the application
echo "🌐 Starting FastAPI application..."
exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --workers ${WORKERS:-1}
#!/bin/bash
set -e

echo "🚀 Starting AI Video Creator"

# Simple environment check (non-blocking)
echo "📋 Environment Status:"
[ -n "$GOOGLE_AI_API_KEY" ] && echo "✅ GOOGLE_AI_API_KEY: configured" || echo "⚠️ GOOGLE_AI_API_KEY: not set"
[ -n "$KLING_API_ACCESS_KEY" ] && echo "✅ KLING_API_ACCESS_KEY: configured" || echo "⚠️ KLING_API_ACCESS_KEY: not set"

# Start the application directly
echo "🌐 Starting FastAPI server..."
exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
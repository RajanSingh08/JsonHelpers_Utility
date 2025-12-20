#!/bin/bash

echo "🚀 Starting Frontend Server..."
echo ""
echo "Frontend will run on: http://localhost:8000"
echo ""
echo "Starting HTTP server..."
echo "Press Ctrl+C to stop"
echo ""
echo "✅ Open http://localhost:8000 in your browser (index.html will load automatically)"
echo ""
echo "📝 Make sure the backend is running on http://localhost:5000"
echo ""

# Check if port 8000 is already in use
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️  Port 8000 is already in use!"
    echo "   Trying port 8080 instead..."
    echo ""
    cd frontend
    PORT=8080 python3 server.py
    echo ""
    echo "✅ Frontend running on: http://localhost:8080"
else
    cd frontend
    python3 server.py
fi


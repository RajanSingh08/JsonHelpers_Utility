#!/bin/bash

echo "🚀 Starting Backend Server..."
echo ""
echo "Backend will run on: http://localhost:5000"
echo ""
echo "Installing dependencies if needed..."
cd backend
pip3 install -r requirements.txt --quiet 2>/dev/null || pip install -r requirements.txt --quiet 2>/dev/null
echo ""
echo "Starting Flask backend server..."
echo "Press Ctrl+C to stop"
echo ""
FLASK_APP=app.py flask run --host=0.0.0.0 --port=5000


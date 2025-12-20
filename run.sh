#!/bin/bash

echo "🚀 Starting JSON Helper..."
echo ""
echo "This will start both backend and frontend servers."
echo ""
echo "Backend will run on: http://localhost:5000"
echo "Frontend will run on: http://localhost:8000"
echo ""
echo "Opening two terminal windows..."
echo ""

# Make scripts executable
chmod +x start-backend.sh
chmod +x start-frontend.sh

# Check OS and open terminals accordingly
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS - open new terminal windows
    osascript -e 'tell application "Terminal" to do script "cd \"'"$(pwd)"'\" && ./start-backend.sh"'
    sleep 2
    osascript -e 'tell application "Terminal" to do script "cd \"'"$(pwd)"'\" && ./start-frontend.sh"'
    echo "✅ Backend and Frontend servers are starting in separate terminal windows"
    echo ""
    echo "Or run manually:"
    echo "  Terminal 1: ./start-backend.sh"
    echo "  Terminal 2: ./start-frontend.sh"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux - use gnome-terminal or xterm
    if command -v gnome-terminal &> /dev/null; then
        gnome-terminal -- bash -c "cd \"$(pwd)\" && ./start-backend.sh; exec bash"
        sleep 1
        gnome-terminal -- bash -c "cd \"$(pwd)\" && ./start-frontend.sh; exec bash"
    else
        echo "Please run in separate terminals:"
        echo "  Terminal 1: ./start-backend.sh"
        echo "  Terminal 2: ./start-frontend.sh"
    fi
else
    echo "Please run in separate terminals:"
    echo "  Terminal 1: ./start-backend.sh"
    echo "  Terminal 2: ./start-frontend.sh"
fi



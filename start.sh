#!/bin/bash

# JSON Helper - Unified Startup Script
# This script replaces run.sh, start-backend.sh, and start-frontend.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKEND_PORT=5000
FRONTEND_PORT=8000
FRONTEND_FALLBACK_PORT=8080
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Function to print colored messages
print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to kill process on port
kill_port() {
    local port=$1
    local pid=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$pid" ]; then
        kill $pid 2>/dev/null || true
        sleep 1
    fi
}

# Function to start backend
start_backend() {
    print_info "Starting Backend Server..."
    
    if check_port $BACKEND_PORT; then
        print_warning "Port $BACKEND_PORT is already in use"
        read -p "Kill existing process? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            kill_port $BACKEND_PORT
        else
            print_error "Cannot start backend. Port $BACKEND_PORT is in use."
            return 1
        fi
    fi
    
    cd "$SCRIPT_DIR/backend"
    
    # Install dependencies if needed
    if [ ! -d "venv" ] && [ ! -d ".venv" ]; then
        print_info "Installing Python dependencies..."
        pip3 install -r requirements.txt --quiet --user 2>/dev/null || \
        pip install -r requirements.txt --quiet --user 2>/dev/null || \
        pip3 install -r requirements.txt --quiet 2>/dev/null || \
        pip install -r requirements.txt --quiet 2>/dev/null
    fi
    
    print_success "Backend starting on http://localhost:$BACKEND_PORT"
    FLASK_APP=app.py flask run --host=0.0.0.0 --port=$BACKEND_PORT
}

# Function to start frontend
start_frontend() {
    print_info "Starting Frontend Server..."
    
    local port=$FRONTEND_PORT
    if check_port $port; then
        print_warning "Port $port is already in use, trying $FRONTEND_FALLBACK_PORT..."
        port=$FRONTEND_FALLBACK_PORT
        if check_port $port; then
            print_error "Both ports $FRONTEND_PORT and $FRONTEND_FALLBACK_PORT are in use"
            return 1
        fi
    fi
    
    cd "$SCRIPT_DIR/frontend"
    
    print_success "Frontend starting on http://localhost:$port"
    print_info "Open http://localhost:$port in your browser"
    
    PORT=$port python3 server.py
}

# Function to start both servers
start_both() {
    print_info "🚀 Starting JSON Helper Application..."
    echo ""
    print_info "Backend will run on: http://localhost:$BACKEND_PORT"
    print_info "Frontend will run on: http://localhost:$FRONTEND_PORT"
    echo ""
    
    # Check if we're on macOS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        print_info "Opening two terminal windows..."
        osascript -e "tell application \"Terminal\" to do script \"cd \\\"$SCRIPT_DIR\\\" && ./start.sh backend\"" 2>/dev/null || true
        sleep 2
        osascript -e "tell application \"Terminal\" to do script \"cd \\\"$SCRIPT_DIR\\\" && ./start.sh frontend\"" 2>/dev/null || true
        print_success "Backend and Frontend servers are starting in separate terminal windows"
        echo ""
        print_info "Or run manually:"
        echo "  Terminal 1: ./start.sh backend"
        echo "  Terminal 2: ./start.sh frontend"
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if command -v gnome-terminal &> /dev/null; then
            gnome-terminal -- bash -c "cd \"$SCRIPT_DIR\" && ./start.sh backend; exec bash" 2>/dev/null || true
            sleep 1
            gnome-terminal -- bash -c "cd \"$SCRIPT_DIR\" && ./start.sh frontend; exec bash" 2>/dev/null || true
        else
            print_info "Please run in separate terminals:"
            echo "  Terminal 1: ./start.sh backend"
            echo "  Terminal 2: ./start.sh frontend"
        fi
    else
        print_info "Please run in separate terminals:"
        echo "  Terminal 1: ./start.sh backend"
        echo "  Terminal 2: ./start.sh frontend"
    fi
}

# Function to stop servers
stop_servers() {
    print_info "Stopping servers..."
    
    if check_port $BACKEND_PORT; then
        kill_port $BACKEND_PORT
        print_success "Backend stopped (port $BACKEND_PORT)"
    else
        print_info "Backend not running (port $BACKEND_PORT)"
    fi
    
    if check_port $FRONTEND_PORT; then
        kill_port $FRONTEND_PORT
        print_success "Frontend stopped (port $FRONTEND_PORT)"
    else
        print_info "Frontend not running (port $FRONTEND_PORT)"
    fi
    
    if check_port $FRONTEND_FALLBACK_PORT; then
        kill_port $FRONTEND_FALLBACK_PORT
        print_success "Frontend stopped (port $FRONTEND_FALLBACK_PORT)"
    fi
}

# Function to show status
show_status() {
    echo ""
    print_info "Server Status:"
    echo ""
    
    if check_port $BACKEND_PORT; then
        print_success "Backend: Running on http://localhost:$BACKEND_PORT"
    else
        print_warning "Backend: Not running"
    fi
    
    if check_port $FRONTEND_PORT; then
        print_success "Frontend: Running on http://localhost:$FRONTEND_PORT"
    elif check_port $FRONTEND_FALLBACK_PORT; then
        print_success "Frontend: Running on http://localhost:$FRONTEND_FALLBACK_PORT"
    else
        print_warning "Frontend: Not running"
    fi
    echo ""
}

# Main script logic
case "${1:-both}" in
    backend)
        start_backend
        ;;
    frontend)
        start_frontend
        ;;
    both|"")
        start_both
        ;;
    stop)
        stop_servers
        ;;
    status)
        show_status
        ;;
    *)
        echo "Usage: $0 [backend|frontend|both|stop|status]"
        echo ""
        echo "Commands:"
        echo "  backend   - Start only the backend server"
        echo "  frontend  - Start only the frontend server"
        echo "  both      - Start both servers (default, opens separate terminals on macOS/Linux)"
        echo "  stop      - Stop all running servers"
        echo "  status    - Show status of servers"
        exit 1
        ;;
esac


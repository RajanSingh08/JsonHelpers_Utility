# JSON Helper - All-in-One JSON Tool

A full-stack web application that combines the best features of jsonpathfinder.com, jsoncompare.org, and jsonviewer.stack.hu into one simple, fast, and developer-friendly tool.

## 🚀 Quick Start

### ⚠️ Important: Don't use `file://` protocol!

**Opening `index.html` directly (file://) will NOT work** due to CORS restrictions. You must run a local server.

### Option 1: Unified Startup Script (Recommended)

**Start both servers:**
```bash
./start.sh
```
This will automatically open two terminal windows (on macOS/Linux) for backend and frontend.

**Or start individually:**
```bash
# Terminal 1 - Backend
./start.sh backend

# Terminal 2 - Frontend  
./start.sh frontend
```

**Other commands:**
```bash
./start.sh status   # Check server status
./start.sh stop     # Stop all servers
```

Backend runs on `http://localhost:5000`  
Frontend runs on `http://localhost:8000`

**Then open `http://localhost:8000` in your browser** (NOT file://)

### Option 2: Docker (Easiest)

**First, install Docker Desktop:**
- Download from: https://www.docker.com/products/docker-desktop/
- Or via Homebrew: `brew install --cask docker`
- Start Docker Desktop application after installation

**Then run:**
```bash
docker compose up
```

This starts both servers in containers. Open `http://localhost:8000` in your browser.

**Note:** Modern Docker uses `docker compose` (subcommand) instead of `docker-compose` (legacy).

### Option 3: Manual Start

**Start Backend:**
```bash
cd backend
pip3 install -r requirements.txt
FLASK_APP=app.py flask run --host=0.0.0.0 --port=5000
```

**Start Frontend (in another terminal):**
```bash
cd frontend
python3 server.py
```

### Why not file://?
- Browser CORS restrictions prevent API calls from `file://` to `http://localhost:5000`
- Running via `http://localhost:8000` allows proper API communication
- The app will show a warning if you try to use `file://`

## ✨ Features

1. **Two JSON Panels** (Side-by-Side)
   - Left: JSON 1
   - Right: JSON 2 (only in Compare Mode)
   - **Tree View**: Expandable/collapsible JSON tree with ► symbols
   - **Text View**: Editable JSON textarea
   - Toggle between Tree and Text views
   - Upload JSON files or paste directly

2. **JSON Path Discovery** (Inspired by jsonpathfinder.com)
   - Click any node in tree view to see full path
   - Paths displayed with "x." notation (replace 'x' with your variable name)
   - Selected path displayed at top with Copy button
   - Instructions shown: "Replace 'x' with the name of your variable"

3. **Global Search**
   - Search bar searches keys, values, and paths
   - Highlights all matches in real-time
   - Works in both Tree and Text views

4. **JSON Diff (Compare Mode)**
   - Enable Compare Mode to show two panels
   - Compare JSON 1 and JSON 2
   - Color-coded highlights (red=removed, green=added, yellow=modified)
   - Detailed diff results

5. **Utilities**
   - **Validate JSON**: Real-time validation with error messages
   - **Beautify JSON**: Format/pretty-print JSON
   - **Minify JSON**: Remove whitespace from JSON
   - **Reset**: Clear JSON input
   - **Dark Mode**: Toggle dark/light theme
   - **Search**: Search keys, values, and paths in real-time

## 🛠️ Tech Stack

- **Backend**: Python Flask with CORS
- **Frontend**: HTML + Tailwind CSS + Vanilla JavaScript
- **Libraries**: 
  - `deepdiff` for JSON comparison
  - `flask-cors` for CORS support

## 📁 Project Structure

```
JsonHelper/
├── backend/
│   ├── app.py              # Flask API server
│   ├── json_finder.py      # JSON finder API endpoints
│   ├── compare_json.py     # JSON comparison API endpoints
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── index.html          # Main HTML file
│   ├── app.js              # Main application logic
│   ├── jsonFinder.js       # JSON finder frontend
│   ├── compareJson.js      # JSON comparison frontend
│   └── server.py           # Frontend HTTP server
├── start.sh                # Unified startup script
├── Dockerfile              # Docker configuration
├── docker-compose.yml      # Docker Compose configuration
└── README.md               # This file
```

## 🎯 API Endpoints

- `POST /api/validate` - Validate JSON and return errors
- `POST /api/format` - Format/beautify JSON
- `POST /api/compare/diff` - Compare two JSONs and return differences
- `POST /api/value` - Get value at a specific path

## 💡 Usage Guide

1. **Start the backend**: `./start.sh backend` or `docker-compose up`
2. **Open frontend**: Open `http://localhost:8000` in browser
3. **Paste JSON**: Paste your JSON in the left panel
4. **View Tree**: Click "Tree" to see expandable JSON structure
5. **Select Path**: Click any node to see its path
6. **Search**: Use search bar to find keys/values
7. **Compare**: Enable Compare Mode to compare two JSONs
8. **Format**: Click "Format JSON" to beautify

## 🐳 Docker Deployment

### Prerequisites

**Install Docker Desktop:**
1. Download from: https://www.docker.com/products/docker-desktop/
2. Or via Homebrew: `brew install --cask docker`
3. Start Docker Desktop application (wait for it to fully start)

### Using Docker Compose (Recommended)

```bash
docker compose up
```

**Note:** Modern Docker uses `docker compose` (subcommand). If you have an older version, you might need `docker-compose` (with hyphen) instead.

### Using Docker directly

```bash
# Build the image
docker build -t json-helper .

# Run the container
docker run -p 5000:5000 -p 8000:8000 json-helper
```

The application will be available at `http://localhost:8000`

## 🏗️ How It Works

### Architecture

```
┌─────────────────┐         ┌─────────────────┐
│   Browser       │         │   Backend       │
│                 │         │   (Flask)       │
│  http://        │────────▶│  localhost:5000 │
│  localhost:8000 │  API    │                 │
│                 │  Calls  │  /api/validate  │
│  index.html     │         │  /api/format    │
│  app.js         │         │  /api/value     │
│  jsonFinder.js  │         │  /api/compare/diff │
│  compareJson.js │         │                 │
└─────────────────┘         └─────────────────┘
      ▲
      │
      │ Served by
      │
┌─────────────────┐
│  Frontend       │
│  Server         │
│  (Python HTTP)  │
│  localhost:8000 │
└─────────────────┘
```

### Why Two Servers?

1. **Backend Server (Flask)**: Handles API requests, JSON processing, validation, formatting
2. **Frontend Server (Python HTTP)**: Serves static files (HTML, CSS, JS) so they're loaded via HTTP protocol

### File Protocol vs HTTP Protocol

**File Protocol (file://) - ❌ Won't Work Properly**

When you open `file:///path/to/index.html` directly:
- Browser loads the HTML file from your local filesystem
- JavaScript tries to make API calls to `http://localhost:5000`
- Browser blocks the requests due to CORS restrictions
- Result: The app loads but API features won't work

**HTTP Server (http://localhost:8000) - ✅ Works Correctly**

When you run the frontend server and open `http://localhost:8000`:
- Python HTTP server serves files from the `frontend/` directory
- Browser loads the HTML via HTTP protocol
- JavaScript makes API calls to `http://localhost:5000`
- CORS allows the requests because both are on `localhost`
- Result: Everything works perfectly!

## 🎨 UI Features

- **Clean, minimal design** using Tailwind CSS
- **Responsive layout** - works on desktop and mobile
- **Dark mode** toggle
- **Fast and lightweight** - no heavy frameworks
- **Developer-friendly** - simple codebase, easy to modify

## 📝 Example Usage

### JSON Finder Mode:
1. Paste JSON in the left panel
2. View the tree structure in the right panel
3. Click on any node (e.g., `payload.meta.fynd_order_id`)
4. See path displayed as: `x.payload.meta.fynd_order_id`
5. Click "Copy" to copy the path
6. Replace 'x' with your variable name in your code

### Compare Mode:
1. Switch to "Compare Jsons" mode
2. Paste first JSON in left panel
3. Paste second JSON in right panel
4. See differences highlighted automatically

## 🔧 Development

- Backend: Flask with REST API
- Frontend: Pure JavaScript (no build step needed)
- Just edit files and refresh browser!

## 🐛 Troubleshooting

### Backend not starting?
- Make sure Python 3 is installed: `python3 --version`
- Install dependencies: `pip3 install -r backend/requirements.txt`
- Check if port 5000 is available: `./start.sh status`
- Try: `./start.sh stop` then `./start.sh backend`

### Frontend not starting?
- Make sure Python 3 is installed
- Check if port 8000 is available: `./start.sh status`
- The script will automatically try port 8080 if 8000 is taken
- Try: `./start.sh stop` then `./start.sh frontend`

### CORS errors?
- Make sure you're using `http://localhost:8000`, not `file://`
- Make sure backend is running on port 5000
- Check browser console for errors
- Verify `API_BASE` in `frontend/app.js` is set to `http://localhost:5000`

### Port already in use?
- Use `./start.sh stop` to stop all servers
- Or manually: `lsof -ti:5000 | xargs kill` and `lsof -ti:8000 | xargs kill`

### Connection refused?
- Backend server is not running
- Start it with `./start.sh backend` or `./start.sh`

## 🛑 Stopping Servers

**Using the script:**
```bash
./start.sh stop
```

**Manually:**
Press `Ctrl+C` in each terminal where servers are running.

Enjoy! 🎉

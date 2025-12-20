# JSON Helper - All-in-One JSON Tool

A full-stack web application that combines the best features of jsonpathfinder.com, jsoncompare.org, and jsonviewer.stack.hu into one simple, fast, and developer-friendly tool.

## 🚀 Quick Start

### ⚠️ Important: Don't use `file://` protocol!

**Opening `index.html` directly (file://) will NOT work** due to CORS restrictions. You must run a local server.

### Option 1: Run Both Servers Separately (Recommended)

**Terminal 1 - Start Backend:**
```bash
./start-backend.sh
```
Backend will run on `http://localhost:5000`

**Terminal 2 - Start Frontend:**
```bash
./start-frontend.sh
```
Frontend will run on `http://localhost:8000`

**Then open `http://localhost:8000` in your browser** (NOT file://)

### Why not file://?
- Browser CORS restrictions prevent API calls from `file://` to `http://localhost:5000`
- Running via `http://localhost:8000` allows proper API communication
- The app will show a warning if you try to use `file://`

### Option 2: Manual Start

**Start Backend:**
```bash
cd backend
pip3 install -r requirements.txt
FLASK_APP=app.py flask run --host=0.0.0.0 --port=5000
```

**Start Frontend (in another terminal):**
```bash
cd frontend
python3 -m http.server 8000
```

### Option 3: Auto Start (macOS)

```bash
./run.sh
```
This will automatically open two terminal windows for backend and frontend.

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
│   └── compareJson.js      # JSON comparison frontend
├── run.sh                  # Quick start script
└── README.md
```

## 🎯 API Endpoints

- `POST /api/validate` - Validate JSON and return errors
- `POST /api/format` - Format/beautify JSON
- `POST /diff` - Compare two JSONs and return differences
- `POST /api/search` - Search for keys, values, or paths
- `POST /api/value` - Get value at a specific path

## 💡 Usage Guide

1. **Start the backend**: `cd backend && flask run`
2. **Open frontend**: Open `frontend/index.html` in browser
3. **Paste JSON**: Paste your JSON in the left panel
4. **View Tree**: Click "Tree" to see expandable JSON structure
5. **Select Path**: Click any node to see its path
6. **Search**: Use search bar to find keys/values
7. **Compare**: Enable Compare Mode to compare two JSONs
8. **Format**: Click "Format JSON" to beautify

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

Enjoy! 🎉

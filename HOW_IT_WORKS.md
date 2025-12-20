# How the Application Works

## Current Setup

### File Protocol (file://) - ❌ Won't Work Properly

When you open `file:///Users/rajansingh/Desktop/JsonHelper/frontend/index.html` directly:

1. **Browser loads the HTML file** from your local filesystem
2. **JavaScript tries to make API calls** to `http://localhost:5000`
3. **Browser blocks the requests** due to CORS (Cross-Origin Resource Sharing) restrictions
4. **Result**: The app loads but API features (beautify, search, etc.) won't work

### HTTP Server (http://localhost:8000) - ✅ Works Correctly

When you run the frontend server and open `http://localhost:8000`:

1. **Python HTTP server** serves files from the `frontend/` directory
2. **Browser loads the HTML** via HTTP protocol
3. **JavaScript makes API calls** to `http://localhost:5000`
4. **CORS allows the requests** because both are on `localhost` (same origin policy)
5. **Result**: Everything works perfectly!

## Architecture

```
┌─────────────────┐         ┌─────────────────┐
│   Browser       │         │   Backend       │
│                 │         │   (Flask)       │
│  http://        │────────▶│  localhost:5000 │
│  localhost:8000 │  API    │                 │
│                 │  Calls  │  /api/validate  │
│  index.html     │         │  /api/format    │
│  app.js         │         │  /api/search    │
│  jsonFinder.js  │         │  /api/value     │
│  compareJson.js │         │  /api/diff      │
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

## Why Two Servers?

1. **Backend Server (Flask)**: Handles API requests, JSON processing, validation, formatting
2. **Frontend Server (Python HTTP)**: Serves static files (HTML, CSS, JS) so they're loaded via HTTP protocol

## Running the Application

### Step-by-Step:

1. **Start Backend** (Terminal 1):
   ```bash
   ./start-backend.sh
   ```
   - Runs Flask on `http://localhost:5000`
   - Handles all API endpoints

2. **Start Frontend** (Terminal 2):
   ```bash
   ./start-frontend.sh
   ```
   - Runs Python HTTP server on `http://localhost:8000`
   - Serves static files from `frontend/` directory

3. **Open Browser**:
   - Go to `http://localhost:8000`
   - NOT `file:///path/to/index.html`

## Troubleshooting

### "CORS error" in console?
- Make sure you're using `http://localhost:8000`, not `file://`
- Make sure backend is running on port 5000
- Check that `API_BASE` in `app.js` is `http://localhost:5000`

### "Connection refused"?
- Backend server is not running
- Start it with `./start-backend.sh`

### Port already in use?
- Frontend script will try port 8080 if 8000 is taken
- Or manually specify: `python3 -m http.server 8080`


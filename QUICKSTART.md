# Quick Start Guide

## Running the Application

### Step 1: Start Backend Server

Open Terminal 1 and run:
```bash
./start-backend.sh
```

Or manually:
```bash
cd backend
pip3 install -r requirements.txt
FLASK_APP=app.py flask run --host=0.0.0.0 --port=5000
```

Backend will be available at: `http://localhost:5000`

### Step 2: Start Frontend Server

Open Terminal 2 and run:
```bash
./start-frontend.sh
```

Or manually:
```bash
cd frontend
python3 -m http.server 8000
```

Frontend will be available at: `http://localhost:8000`

### Step 3: Open in Browser

Open your browser and go to:
```
http://localhost:8000
```

## Troubleshooting

### Backend not starting?
- Make sure Python 3 is installed: `python3 --version`
- Install dependencies: `pip3 install -r backend/requirements.txt`
- Check if port 5000 is available

### Frontend not starting?
- Make sure Python 3 is installed
- Check if port 8000 is available
- Try a different port: `python3 -m http.server 8080`

### CORS errors?
- Make sure backend is running on port 5000
- Check browser console for errors
- Verify `API_BASE` in `frontend/app.js` is set to `http://localhost:5000`

## Stopping Servers

Press `Ctrl+C` in each terminal to stop the servers.


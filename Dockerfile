# Dockerfile for JSON Helper Application
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

# Copy application code
COPY backend/ /app/backend/
COPY frontend/ /app/frontend/

# Create startup script
RUN echo '#!/bin/bash\n\
set -e\n\
echo "🚀 Starting JSON Helper Application..."\n\
cd /app/backend && FLASK_APP=app.py flask run --host=0.0.0.0 --port=5000 &\n\
cd /app/frontend && python3 server.py &\n\
wait\n\
' > /app/start.sh && chmod +x /app/start.sh

# Expose ports
EXPOSE 5000 8000

# Start both servers
CMD ["/app/start.sh"]


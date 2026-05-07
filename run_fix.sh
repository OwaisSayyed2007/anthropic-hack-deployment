#!/bin/bash
# run_fix.sh - Startup script using Python 3.11

echo "Starting FIWB with Python 3.11..."

# Backend
cd backend
if [ ! -d "venv311" ]; then
    echo "Creating Python 3.11 virtual environment..."
    /opt/homebrew/bin/python3.11 -m venv venv311
    source venv311/bin/activate
    pip install --upgrade pip
    pip install -r requirements.txt
else
    source venv311/bin/activate
fi

echo "Starting Backend..."
uvicorn app.main:app --host 127.0.0.1 --port 8002 &
BACKEND_PID=$!

# Frontend
cd ../frontend
echo "Starting Frontend..."
npm run dev &
FRONTEND_PID=$!

echo "Both servers are starting!"
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:8002"

trap "kill $BACKEND_PID $FRONTEND_PID" SIGINT SIGTERM
wait

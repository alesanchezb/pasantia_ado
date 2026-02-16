#!/bin/bash

# Function to kill background processes on exit
cleanup() {
    echo "Stopping servers..."
    if [ -n "$BACKEND_PID" ]; then
        kill $BACKEND_PID
    fi
    exit
}

# Trap SIGINT (Ctrl+C)
trap cleanup SIGINT

# Ensure ports are clean
./stop.sh

echo "🚀 Starting Project..."

# Start Backend
echo "Starting Backend (Django)..."
cd backend

# Check if venv exists, if not create it
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
else
    source venv/bin/activate
fi

# Run migrations to be safe
python manage.py migrate

# Run server in background
python manage.py runserver &
BACKEND_PID=$!
cd ..

# Start Frontend
echo "Starting Frontend (Vite)..."
cd frontend

# Check if node_modules exists, if not install
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

npm run dev

# Wait for frontend to exit (though npm run dev usually keeps running)
wait $BACKEND_PID

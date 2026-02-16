#!/bin/bash

echo "🧹 Cleaning up ports..."

# Function to kill process on a port
kill_port() {
    PORT=$1
    NAME=$2
    PID=$(lsof -t -i:$PORT)
    if [ -n "$PID" ]; then
        echo "Killing $NAME on port $PORT (PID: $PID)..."
        kill -9 $PID
    else
        echo "No process found on port $PORT ($NAME)."
    fi
}

kill_port 8000 "Django Backend"
kill_port 5173 "Vite Frontend"

echo "✅ Ports cleared."

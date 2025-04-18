#!/usr/bin/env bash
# Quick frontend start script
set -euo pipefail

cd "$(dirname "$0")/frontend"

# Kill any existing Vite dev servers
pkill -f 'vite.*--port' &>/dev/null || true

# Find available port
PORT=3002
while lsof -iTCP:"$PORT" -sTCP:LISTEN &>/dev/null; do
  ((PORT++))
done

# Start frontend with minimal output
echo "Starting frontend on port $PORT..."
FRONTEND_PORT=$PORT npm run dev
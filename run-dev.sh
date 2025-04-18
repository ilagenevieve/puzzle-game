#!/bin/bash

# Ocean of Puzzles Development Starter
# This script starts the frontend and backend services with the correct port configuration

# Set colors for output
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE} Ocean of Puzzles Development Starter ${NC}"
echo -e "${BLUE}=========================================${NC}"

# Create log directory if it doesn't exist
mkdir -p logs

# Define port configuration
export PORT=4001
export FRONTEND_PORT=3001
export PEERJS_PORT=9001
export CORS_ORIGIN=http://localhost:3001

echo -e "${GREEN}Using port configuration:${NC}"
echo -e "  Frontend: ${YELLOW}$FRONTEND_PORT${NC}"
echo -e "  Backend:  ${YELLOW}$PORT${NC}"
echo -e "  PeerJS:   ${YELLOW}$PEERJS_PORT${NC}"

# Check if ports are already in use
backend_in_use=$(ss -tuln | grep -q ":$PORT " && echo "yes" || echo "no")
frontend_in_use=$(ss -tuln | grep -q ":$FRONTEND_PORT " && echo "yes" || echo "no")
peerjs_in_use=$(ss -tuln | grep -q ":$PEERJS_PORT " && echo "yes" || echo "no")

if [ "$backend_in_use" == "yes" ] || [ "$frontend_in_use" == "yes" ] || [ "$peerjs_in_use" == "yes" ]; then
  echo -e "${RED}Error: Some ports are already in use:${NC}"
  [ "$backend_in_use" == "yes" ] && echo -e "  - Port $PORT (Backend) is in use"
  [ "$frontend_in_use" == "yes" ] && echo -e "  - Port $FRONTEND_PORT (Frontend) is in use"
  [ "$peerjs_in_use" == "yes" ] && echo -e "  - Port $PEERJS_PORT (PeerJS) is in use"
  echo -e "${YELLOW}Please change the port configuration in the .env file or stop the conflicting services.${NC}"
  exit 1
fi

# Start backend in the background
echo -e "${BLUE}Starting backend on port $PORT...${NC}"
cd backend || { echo -e "${RED}Error: backend directory not found${NC}"; exit 1; }
npm run dev > ../logs/backend.log 2>&1 &
BACKEND_PID=$!

# Check if backend started successfully
sleep 3
if ps -p $BACKEND_PID > /dev/null; then
  echo -e "${GREEN}Backend started successfully! (PID: $BACKEND_PID)${NC}"
  echo -e "  API:    ${YELLOW}http://localhost:$PORT/api/v1${NC}"
  echo -e "  Health: ${YELLOW}http://localhost:$PORT/health${NC}"
else
  echo -e "${RED}Failed to start backend. Check logs/backend.log for details.${NC}"
  exit 1
fi

# Start frontend in the background
echo -e "${BLUE}Starting frontend on port $FRONTEND_PORT...${NC}"
cd ../frontend || { echo -e "${RED}Error: frontend directory not found${NC}"; exit 1; }
npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!

# Check if frontend started successfully
sleep 5
if ps -p $FRONTEND_PID > /dev/null; then
  echo -e "${GREEN}Frontend started successfully! (PID: $FRONTEND_PID)${NC}"
  echo -e "  UI: ${YELLOW}http://localhost:$FRONTEND_PORT${NC}"
else
  echo -e "${RED}Failed to start frontend. Check logs/frontend.log for details.${NC}"
  # Kill the backend if frontend failed
  kill $BACKEND_PID 2>/dev/null
  exit 1
fi

# Return to the project root
cd ..

echo -e "${BLUE}=========================================${NC}"
echo -e "${GREEN}Development environment is now running!${NC}"
echo -e "  Frontend: ${YELLOW}http://localhost:$FRONTEND_PORT${NC}"
echo -e "  Backend:  ${YELLOW}http://localhost:$PORT/api/v1${NC}"
echo -e "${BLUE}=========================================${NC}"
echo -e "${YELLOW}Logs are saved in:${NC}"
echo -e "  Backend:  ${YELLOW}logs/backend.log${NC}"
echo -e "  Frontend: ${YELLOW}logs/frontend.log${NC}"
echo -e "${BLUE}=========================================${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"

# Handle Ctrl+C gracefully
trap "echo -e '${BLUE}Stopping services...${NC}'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo -e '${GREEN}Services stopped.${NC}'; exit 0" INT

# Wait for user to press Ctrl+C
while true; do
  sleep 1
done
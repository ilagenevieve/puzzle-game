#!/bin/bash
# Port checking script
# This script checks if the required ports are available before starting the application

# ANSI color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Load environment variables from .env file if it exists
if [ -f .env ]; then
  source .env
fi

# Define default ports if not set in .env
FRONTEND_PORT=${FRONTEND_PORT:-3000}
BACKEND_PORT=${PORT:-4000}
PEERJS_PORT=${PEERJS_PORT:-9000}

# Print header
echo -e "${BLUE}===============================================${NC}"
echo -e "${BLUE}      Ocean of Puzzles - Port Checker       ${NC}"
echo -e "${BLUE}===============================================${NC}"
echo ""
echo -e "${BOLD}Checking if required ports are available...${NC}"
echo ""

# Function to check if a port is in use
check_port() {
    local port=$1
    local service=$2
    
    # Use ss to check if port is in use
    if ss -tuln | grep -q ":$port "; then
        echo -e "${RED}✘ Port $port ($service) is already in use!${NC}"
        
        # Try to show what's using the port
        pid=$(lsof -i:$port -t 2>/dev/null)
        if [ -n "$pid" ]; then
            echo -e "  Process using this port: $(ps -p $pid -o comm= 2>/dev/null || echo "Unknown")"
            echo -e "  Process ID: $pid"
        fi
        
        echo -e "  ${YELLOW}Consider changing the port in your .env file${NC}"
        echo ""
        return 1
    else
        echo -e "${GREEN}✓ Port $port ($service) is available${NC}"
        return 0
    fi
}

# Check all required ports
frontend_ok=true
backend_ok=true
peerjs_ok=true

# Check frontend port
check_port $FRONTEND_PORT "Frontend" || frontend_ok=false

# Check backend port
check_port $BACKEND_PORT "Backend API" || backend_ok=false

# Check PeerJS port
check_port $PEERJS_PORT "PeerJS Server" || peerjs_ok=false

echo ""

# Summary
if $frontend_ok && $backend_ok && $peerjs_ok; then
    echo -e "${GREEN}✓ All ports are available!${NC}"
    echo -e "${GREEN}✓ You can safely start the application.${NC}"
    echo ""
    echo -e "  Frontend: http://localhost:$FRONTEND_PORT"
    echo -e "  Backend API: http://localhost:$BACKEND_PORT/api/v1"
    echo -e "  PeerJS: ws://localhost:$PEERJS_PORT"
    echo ""
    exit 0
else
    echo -e "${RED}✘ Some ports are already in use.${NC}"
    echo -e "${YELLOW}Recommendation:${NC}"
    echo -e "  1. Edit your ${BOLD}.env${NC} file and change the port configuration:"
    
    if ! $frontend_ok; then
        echo -e "     - Change ${BOLD}FRONTEND_PORT=${FRONTEND_PORT}${NC} to an available port"
    fi
    
    if ! $backend_ok; then
        echo -e "     - Change ${BOLD}PORT=${BACKEND_PORT}${NC} to an available port"
    fi
    
    if ! $peerjs_ok; then
        echo -e "     - Change ${BOLD}PEERJS_PORT=${PEERJS_PORT}${NC} to an available port"
    fi
    
    echo -e "  2. Update ${BOLD}CORS_ORIGIN=${CORS_ORIGIN:-http://localhost:$FRONTEND_PORT}${NC} to match your new frontend port"
    echo -e "  3. Kill any conflicting processes with: ${BOLD}kill <PID>${NC}"
    echo ""
    echo -e "${BLUE}===============================================${NC}"
    exit 1
fi
#!/usr/bin/env bash
# Ocean of Puzzles - quick-start script
set -Eeuo pipefail

# --- helpers -----------------------------------------------------------
color() { tput setaf "$1"; }
ok()    { echo "$(color 2)✓ $*$(tput sgr0)"; }
warn()  { echo "$(color 3)! $*$(tput sgr0)"; }
die()   { echo "$(color 1)✘ $*$(tput sgr0)"; exit 1; }
header(){ echo; printf '%s\n' "$(color 4)🌊 $*$(tput sgr0)"; echo; }

need()  { command -v "$1" &>/dev/null || die "$1 not found in PATH"; }
free()  { 
  local p=$1
  while lsof -iTCP:"$p" -sTCP:LISTEN &>/dev/null; do
    ((p++))
  done
  echo "$p"
}

# --- prerequisites ----------------------------------------------------
header "Ocean of Puzzles - Development Environment"

need node
need npm
need docker

# Stop any existing dev servers
pkill -f 'vite.*--port' &>/dev/null || true
pkill -f 'node.*src/app.js' &>/dev/null || true

# Check Docker daemon
if ! docker info &>/dev/null; then
  die "Docker daemon not running or permission issue"
fi

# Rootless Docker check
if docker info 2>/dev/null | grep -q "rootless: false"; then
  warn "You're running Docker in root mode. Consider using rootless Docker."
  warn "To set up: dockerd-rootless-setuptool.sh install"
fi

# --- env & ports ------------------------------------------------------
# Ensure we're in the project root
ROOT=$(cd "$(dirname "$0")" && pwd)
cd "$ROOT"

# Create logs directory
mkdir -p "$ROOT/logs"

# Load environment variables
if [[ -f "$ROOT/.env" ]]; then
  # shellcheck disable=SC1091
  source "$ROOT/.env"
fi

# Set default ports if not defined
PORT=${PORT:-4000}
FRONTEND_PORT=${FRONTEND_PORT:-3000}
PEERJS_PORT=${PEERJS_PORT:-9000}

# Find available ports if DYNAMIC_PORTS is enabled
if [[ ${DYNAMIC_PORTS:-0} == 1 ]]; then
  PORT=$(free "$PORT")
  FRONTEND_PORT=$(free "$FRONTEND_PORT")
  PEERJS_PORT=$(free "$PEERJS_PORT")
  export PORT FRONTEND_PORT PEERJS_PORT
  export CORS_ORIGIN="http://localhost:$FRONTEND_PORT"
  ok "Using ports → Frontend: $FRONTEND_PORT  Backend: $PORT  PeerJS: $PEERJS_PORT"
else
  # Check if ports are available
  PORTS_AVAILABLE=true
  
  if ! lsof -iTCP:"$PORT" -sTCP:LISTEN &>/dev/null; then
    ok "Port $PORT (Backend) is available"
  else
    PID=$(lsof -iTCP:"$PORT" -sTCP:LISTEN -t)
    warn "Port $PORT (Backend) is in use by PID: $PID"
    PORTS_AVAILABLE=false
  fi
  
  if ! lsof -iTCP:"$FRONTEND_PORT" -sTCP:LISTEN &>/dev/null; then
    ok "Port $FRONTEND_PORT (Frontend) is available"
  else
    PID=$(lsof -iTCP:"$FRONTEND_PORT" -sTCP:LISTEN -t)
    warn "Port $FRONTEND_PORT (Frontend) is in use by PID: $PID"
    PORTS_AVAILABLE=false
  fi
  
  if ! lsof -iTCP:"$PEERJS_PORT" -sTCP:LISTEN &>/dev/null; then
    ok "Port $PEERJS_PORT (PeerJS) is available"
  else
    PID=$(lsof -iTCP:"$PEERJS_PORT" -sTCP:LISTEN -t)
    warn "Port $PEERJS_PORT (PeerJS) is in use by PID: $PID"
    PORTS_AVAILABLE=false
  fi
  
  if [[ "$PORTS_AVAILABLE" == "false" ]]; then
    warn "Some ports are already in use. Run with DYNAMIC_PORTS=1 to automatically find available ports:"
    echo "  DYNAMIC_PORTS=1 $0"
    if [[ ${FORCE:-0} != 1 ]]; then
      exit 1
    else
      warn "Proceeding anyway due to FORCE=1..."
    fi
  fi
fi

# --- sub-commands ----------------------------------------------------
case ${1:-all} in
  all|dev)
    header "Starting full development environment"
    
    # Start backend
    echo "Starting backend on port $PORT..."
    LOG_FILE="$ROOT/logs/backend.log"
    > "$LOG_FILE"  # Clear log file
    cd "$ROOT/backend" || die "Backend directory not found"
    NODE_ENV=development npm run dev > "$LOG_FILE" 2>&1 &
    BACKEND_PID=$!
    
    # Check backend started
    if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
      die "Backend failed to start. Check $LOG_FILE"
    fi
    ok "Backend started (PID: $BACKEND_PID)"
    
    # Start frontend
    echo "Starting frontend on port $FRONTEND_PORT..."
    LOG_FILE="$ROOT/logs/frontend.log"
    > "$LOG_FILE"  # Clear log file
    cd "$ROOT/frontend" || die "Frontend directory not found"
    npm run dev > "$LOG_FILE" 2>&1 &
    FRONTEND_PID=$!
    
    # Check frontend started
    if ! kill -0 "$FRONTEND_PID" 2>/dev/null; then
      kill "$BACKEND_PID" 2>/dev/null
      die "Frontend failed to start. Check $LOG_FILE"
    fi
    ok "Frontend started (PID: $FRONTEND_PID)"
    
    # Display success message
    header "Development environment running"
    echo "Frontend: http://localhost:$FRONTEND_PORT"
    echo "Backend:  http://localhost:$PORT/api/v1"
    echo "PeerJS:   ws://localhost:$PEERJS_PORT"
    echo
    echo "Logs saved to:"
    echo "  Backend:  $ROOT/logs/backend.log"
    echo "  Frontend: $ROOT/logs/frontend.log"
    echo
    echo "Press Ctrl+C to stop all services"
    
    # Set up cleanup trap
    trap 'echo; echo "Stopping services..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo "Services stopped."; exit 0' INT TERM
    
    # Wait for Ctrl+C
    wait
    ;;
    
  front)
    header "Starting frontend only"
    cd "$ROOT/frontend" || die "Frontend directory not found"
    FRONTEND_PORT=$FRONTEND_PORT npm run dev
    ;;
    
  back)
    header "Starting backend only"
    cd "$ROOT/backend" || die "Backend directory not found"
    PORT=$PORT npm run dev
    ;;
    
  compose)
    header "Starting Docker Compose environment"
    
    # Check if we should use Traefik or basic setup
    if [[ -f "$ROOT/docker-compose.dev.yml" && -d "$ROOT/certs" ]]; then
      echo "Using enhanced Docker setup with Traefik..."
      docker-compose -f docker-compose.dev.yml up --build
    else
      echo "Using basic Docker setup..."
      docker-compose up --build
    fi
    ;;
    
  clean)
    header "Cleaning up Docker environment"
    docker-compose down -v --remove-orphans
    ok "Docker environment cleaned"
    ;;
    
  check)
    header "Running CI checks locally"
    cd "$ROOT"
    
    ok "Running linting..."
    npm run lint
    
    ok "Running tests..."
    npm test
    
    ok "All checks completed"
    ;;
    
  *)
    header "Ocean of Puzzles Development Script"
    echo "Usage: $0 [command]"
    echo
    echo "Commands:"
    echo "  all, dev    Full stack development (default)"
    echo "  front       Frontend only"
    echo "  back        Backend only"
    echo "  compose     Start with Docker Compose"
    echo "  clean       Stop and remove Docker containers"
    echo "  check       Run linting and tests (CI simulation)"
    echo
    echo "Environment variables:"
    echo "  DYNAMIC_PORTS=1    Automatically find available ports"
    echo "  FORCE=1            Proceed even if ports are in use"
    echo "  NODE_ENV=debug     Enable verbose logging"
    echo
    echo "Examples:"
    echo "  $0                 Start full development environment"
    echo "  $0 front           Start frontend only"
    echo "  DYNAMIC_PORTS=1 $0 Start with auto port assignment"
    ;;
esac
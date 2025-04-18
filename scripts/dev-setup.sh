#!/bin/bash
# Developer setup script
# This script sets up the full development environment with proper domain routing

# ANSI color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Print header
echo -e "${BLUE}===============================================${NC}"
echo -e "${BLUE}  Ocean of Puzzles - Developer Setup Script  ${NC}"
echo -e "${BLUE}===============================================${NC}"
echo ""

# Make sure we're in the project root
PROJECT_ROOT=$(cd "$(dirname "$0")/.." && pwd)
cd "$PROJECT_ROOT"

echo -e "${YELLOW}Setting up development environment in:${NC}"
echo -e "${BOLD}$PROJECT_ROOT${NC}"
echo ""

# 1. Check for Docker and docker-compose
echo -e "${BLUE}== Checking prerequisites ==${NC}"
if ! command -v docker &> /dev/null; then
  echo -e "${RED}Error: Docker is not installed${NC}"
  echo -e "${YELLOW}Please install Docker first:${NC}"
  echo -e "  https://docs.docker.com/engine/install/"
  exit 1
fi

if ! command -v docker-compose &> /dev/null; then
  echo -e "${RED}Error: docker-compose is not installed${NC}"
  echo -e "${YELLOW}Please install docker-compose first:${NC}"
  echo -e "  https://docs.docker.com/compose/install/"
  exit 1
fi

# Check for npm
if ! command -v npm &> /dev/null; then
  echo -e "${RED}Error: npm is not installed${NC}"
  echo -e "${YELLOW}Please install Node.js first:${NC}"
  echo -e "  https://nodejs.org/en/download/"
  exit 1
fi

# 2. Install dependencies if needed
echo -e "${BLUE}== Installing dependencies ==${NC}"
if [ ! -d "$PROJECT_ROOT/backend/node_modules" ]; then
  echo -e "${YELLOW}Installing backend dependencies...${NC}"
  cd "$PROJECT_ROOT/backend" && npm install
  echo -e "${GREEN}✓ Backend dependencies installed${NC}"
else
  echo -e "${GREEN}✓ Backend dependencies already installed${NC}"
fi

if [ ! -d "$PROJECT_ROOT/frontend/node_modules" ]; then
  echo -e "${YELLOW}Installing frontend dependencies...${NC}"
  cd "$PROJECT_ROOT/frontend" && npm install
  echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
else
  echo -e "${GREEN}✓ Frontend dependencies already installed${NC}"
fi

# Return to project root
cd "$PROJECT_ROOT"

# 3. Create certs directory if it doesn't exist
if [ ! -d "$PROJECT_ROOT/certs" ]; then
  echo -e "${YELLOW}Creating certs directory...${NC}"
  mkdir -p "$PROJECT_ROOT/certs"
  echo -e "${GREEN}✓ Certs directory created${NC}"
else
  echo -e "${GREEN}✓ Certs directory already exists${NC}"
fi

# 4. Check port availability
echo -e "${BLUE}== Checking port availability ==${NC}"
./scripts/check-ports.js || {
  echo -e "${YELLOW}Would you like to run the port-config-fix.sh script to resolve port conflicts? (y/n)${NC}"
  read -n 1 -r
  echo ""
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    ./scripts/port-config-fix.sh
  else
    echo -e "${YELLOW}Please resolve port conflicts manually before proceeding.${NC}"
    exit 1
  fi
}

# 5. Prompt to set up local domains
echo -e "${BLUE}== Setting up local domains ==${NC}"
echo -e "${YELLOW}Would you like to set up local domains in /etc/hosts? (requires sudo) (y/n)${NC}"
read -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
  sudo ./scripts/setup-local-domains.sh
else
  echo -e "${YELLOW}Skipping local domains setup.${NC}"
  echo -e "${YELLOW}You'll need to add the following to your /etc/hosts file manually:${NC}"
  echo -e "127.0.0.1 puzzles.local api.puzzles.local peerjs.puzzles.local traefik.puzzles.local"
fi

# 6. Prompt to set up local certificates
echo -e "${BLUE}== Setting up local certificates ==${NC}"
echo -e "${YELLOW}Would you like to set up local certificates for HTTPS? (y/n)${NC}"
read -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
  ./scripts/setup-local-certs.sh
else
  echo -e "${YELLOW}Skipping local certificates setup.${NC}"
  echo -e "${YELLOW}You'll need to use HTTP for local development.${NC}"
fi

# 7. Create a .env file if it doesn't exist
if [ ! -f "$PROJECT_ROOT/.env" ]; then
  echo -e "${BLUE}== Creating .env file ==${NC}"
  cp "$PROJECT_ROOT/.env.example" "$PROJECT_ROOT/.env" 2>/dev/null || {
    echo -e "${YELLOW}Creating default .env file...${NC}"
    cat > "$PROJECT_ROOT/.env" << EOL
# Application Settings
NODE_ENV=development
PORT=4000
FRONTEND_PORT=3000
PEERJS_PORT=9000

# Database Configuration
DB_PATH=./db/puzzle_game.sqlite

# Session Configuration
SESSION_SECRET=dev_session_secret_$(openssl rand -hex 12)
SESSION_MAX_AGE=604800000  # 7 days in milliseconds
SESSION_INACTIVE_TIMEOUT=1800000  # 30 minutes in milliseconds

# Security Settings
CORS_ORIGIN=http://puzzles.local
SECURE_COOKIES=false  # Set to true when using HTTPS

# PeerJS Configuration
PEERJS_KEY=peerjs
PEERJS_PATH=/peerjs
STUN_SERVER=stun:stun.l.google.com:19302
EOL
  }
  echo -e "${GREEN}✓ .env file created${NC}"
else
  echo -e "${GREEN}✓ .env file already exists${NC}"
fi

# 8. Start the development environment
echo -e "${BLUE}== Starting development environment ==${NC}"
echo -e "${YELLOW}Would you like to start the development environment now? (y/n)${NC}"
read -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo -e "${CYAN}Starting Docker containers...${NC}"
  docker-compose -f docker-compose.dev.yml up -d
  echo -e "${GREEN}✓ Development environment started!${NC}"
  echo -e "${GREEN}✓ You can now access:${NC}"
  echo -e "  ${BOLD}Frontend:${NC} http://puzzles.local"
  echo -e "  ${BOLD}Backend API:${NC} http://api.puzzles.local/api/v1"
  echo -e "  ${BOLD}PeerJS:${NC} ws://peerjs.puzzles.local/peerjs"
  echo -e "  ${BOLD}Traefik Dashboard:${NC} http://traefik.puzzles.local:8080"
else
  echo -e "${YELLOW}Skipping environment startup.${NC}"
  echo -e "${YELLOW}To start the environment manually:${NC}"
  echo -e "  ${BOLD}docker-compose -f docker-compose.dev.yml up -d${NC}"
fi

echo ""
echo -e "${BLUE}===============================================${NC}"
echo -e "${GREEN}✓ Developer setup complete!${NC}"
echo -e "${BLUE}===============================================${NC}"

# 9. Display helpful information
echo -e "${CYAN}Helpful commands:${NC}"
echo -e "  ${BOLD}docker-compose -f docker-compose.dev.yml up -d${NC} - Start the environment"
echo -e "  ${BOLD}docker-compose -f docker-compose.dev.yml down${NC} - Stop the environment"
echo -e "  ${BOLD}docker-compose -f docker-compose.dev.yml logs -f${NC} - View logs"
echo -e "  ${BOLD}docker exec -it puzzle-game-backend-dev bash${NC} - Shell into backend"
echo -e "  ${BOLD}docker exec -it puzzle-game-frontend-dev sh${NC} - Shell into frontend"
echo ""
echo -e "${YELLOW}For development without Docker, you can also run:${NC}"
echo -e "  ${BOLD}cd backend && npm run dev${NC} - Start the backend"
echo -e "  ${BOLD}cd frontend && npm run dev${NC} - Start the frontend"
echo ""
echo -e "${BLUE}Happy coding!${NC}"
#!/bin/bash

# Port Configuration Fix Script
# This script is designed to help manage port conflicts in the Ocean of Puzzles application

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
echo -e "${BLUE}    Ocean of Puzzles - Port Configuration    ${NC}"
echo -e "${BLUE}===============================================${NC}"
echo ""

# First, check if all ports are already available
if ./scripts/check-ports.sh > /dev/null; then
  echo -e "${GREEN}✓ All ports are already available. No fixes needed!${NC}"
  echo -e "${GREEN}✓ You can start the application normally.${NC}"
  echo ""
  exit 0
fi

# If we get here, some ports need fixing
echo -e "${YELLOW}Detected port conflicts in your environment.${NC}"
echo -e "${CYAN}Looking for available ports...${NC}"
echo ""

# Find available ports
find_available_port() {
  local start_port=$1
  local max_tries=100
  local port=$start_port
  
  for (( i=0; i<max_tries; i++ )); do
    if ! ss -tuln | grep -q ":$port "; then
      echo $port
      return 0
    fi
    port=$((port + 1))
  done
  
  # If we couldn't find an available port
  echo -1
  return 1
}

# Find available ports
new_frontend_port=$(find_available_port 3002)
new_backend_port=$(find_available_port 4002)
new_peerjs_port=$(find_available_port 9001)

if [[ $new_frontend_port -eq -1 || $new_backend_port -eq -1 || $new_peerjs_port -eq -1 ]]; then
  echo -e "${RED}Failed to find available ports!${NC}"
  echo -e "${RED}Please manually check your system for available ports.${NC}"
  exit 1
fi

# Show the current and new port configuration
echo -e "${BOLD}Current port configuration:${NC}"
echo -e "  Frontend: $(grep "FRONTEND_PORT=" .env | cut -d'=' -f2)"
echo -e "  Backend:  $(grep "^PORT=" .env | cut -d'=' -f2)"
echo -e "  PeerJS:   $(grep "PEERJS_PORT=" .env | cut -d'=' -f2)"
echo -e "  CORS:     $(grep "CORS_ORIGIN=" .env | cut -d'=' -f2)"
echo ""

echo -e "${BOLD}Recommended port configuration:${NC}"
echo -e "  Frontend: ${GREEN}$new_frontend_port${NC}"
echo -e "  Backend:  ${GREEN}$new_backend_port${NC}"
echo -e "  PeerJS:   ${GREEN}$new_peerjs_port${NC}"
echo -e "  CORS:     ${GREEN}http://localhost:$new_frontend_port${NC}"
echo ""

# Ask user if they want to update the configuration
read -p "Do you want to update the .env file with these ports? (y/n): " choice
if [[ $choice =~ ^[Yy]$ ]]; then
  # Create a backup of the .env file
  cp .env .env.backup

  # Update the .env file
  sed -i "s/^PORT=.*/PORT=$new_backend_port/" .env
  sed -i "s/^FRONTEND_PORT=.*/FRONTEND_PORT=$new_frontend_port/" .env
  sed -i "s/^PEERJS_PORT=.*/PEERJS_PORT=$new_peerjs_port/" .env
  sed -i "s|^CORS_ORIGIN=.*|CORS_ORIGIN=http://localhost:$new_frontend_port|" .env

  echo -e "${GREEN}✓ .env file updated successfully!${NC}"
  echo -e "${YELLOW}Note: A backup of your original .env file was saved as .env.backup${NC}"
  echo ""
  
  # Run the check ports script again to verify
  ./scripts/check-ports.sh
  
  echo ""
  echo -e "${CYAN}You can now start the application with:${NC}"
  echo -e "  ${BOLD}./scripts/start-dev.sh${NC}"
  echo -e "    or"
  echo -e "  ${BOLD}./run-dev.sh${NC}"
else
  echo -e "${YELLOW}No changes were made to your configuration.${NC}"
  echo -e "${YELLOW}You will need to manually update your .env file to resolve port conflicts.${NC}"
fi

echo ""
echo -e "${BLUE}===============================================${NC}"
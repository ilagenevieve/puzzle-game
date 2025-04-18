#!/bin/bash
# Local domain setup script for development
# This script adds the required entries to /etc/hosts for local development

# ANSI color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Define the domains to add
DOMAINS=(
  "puzzles.local"
  "api.puzzles.local"
  "peerjs.puzzles.local"
)

# Print header
echo -e "${BLUE}===============================================${NC}"
echo -e "${BLUE}  Ocean of Puzzles - Local Domains Setup    ${NC}"
echo -e "${BLUE}===============================================${NC}"
echo ""

# Check if script is run as root
if [ "$EUID" -ne 0 ]; then
  echo -e "${YELLOW}This script needs to be run as root to modify /etc/hosts${NC}"
  echo -e "Please run with sudo: ${BOLD}sudo $0${NC}"
  exit 1
fi

# Check if entries already exist
HOSTS_UPDATED=true
for DOMAIN in "${DOMAINS[@]}"; do
  if ! grep -q "$DOMAIN" /etc/hosts; then
    HOSTS_UPDATED=false
    break
  fi
done

if $HOSTS_UPDATED; then
  echo -e "${GREEN}✓ All domain entries already exist in /etc/hosts${NC}"
  echo ""
  echo -e "Configured domains:"
  for DOMAIN in "${DOMAINS[@]}"; do
    grep "$DOMAIN" /etc/hosts
  done
  echo ""
  echo -e "${BLUE}No changes needed.${NC}"
  exit 0
fi

# Backup the original hosts file
BACKUP_FILE="/etc/hosts.bak.$(date +%Y%m%d%H%M%S)"
cp /etc/hosts "$BACKUP_FILE"
echo -e "${YELLOW}Backup of /etc/hosts created at ${BACKUP_FILE}${NC}"

# Add entries to /etc/hosts
echo "" >> /etc/hosts
echo "# Ocean of Puzzles local development domains" >> /etc/hosts
for DOMAIN in "${DOMAINS[@]}"; do
  echo "127.0.0.1 $DOMAIN" >> /etc/hosts
  echo -e "${GREEN}✓ Added ${BOLD}$DOMAIN${NC}${GREEN} to /etc/hosts${NC}"
done

echo ""
echo -e "${GREEN}✓ Local domains setup complete!${NC}"
echo -e "${YELLOW}The following entries have been added to /etc/hosts:${NC}"
echo ""
grep -A 5 "Ocean of Puzzles" /etc/hosts
echo ""
echo -e "${BLUE}You can now access:${NC}"
echo -e "  ${BOLD}Frontend:${NC} http://puzzles.local"
echo -e "  ${BOLD}Backend API:${NC} http://api.puzzles.local/api/v1"
echo -e "  ${BOLD}PeerJS:${NC} ws://peerjs.puzzles.local/peerjs"
echo ""
echo -e "${YELLOW}NOTE: To use these domains with HTTPS in development,${NC}"
echo -e "${YELLOW}you'll need to create self-signed certificates.${NC}"
echo -e "${YELLOW}Run the setup-local-certs.sh script to generate them.${NC}"
echo ""
echo -e "${BLUE}===============================================${NC}"
#!/bin/bash
# Local certificate generator for development
# This script creates self-signed certificates for local development with HTTPS

# ANSI color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Define the domains
DOMAINS=(
  "puzzles.local"
  "api.puzzles.local"
  "peerjs.puzzles.local"
)

# Print header
echo -e "${BLUE}===============================================${NC}"
echo -e "${BLUE}  Ocean of Puzzles - Local Certificates Setup ${NC}"
echo -e "${BLUE}===============================================${NC}"
echo ""

# Check if mkcert is installed
if ! command -v mkcert &> /dev/null; then
  echo -e "${RED}Error: mkcert is not installed${NC}"
  echo -e "${YELLOW}Please install mkcert first:${NC}"
  echo -e "  Ubuntu/Debian: ${BOLD}apt install mkcert${NC}"
  echo -e "  MacOS: ${BOLD}brew install mkcert${NC}"
  echo -e "  For other systems, see: https://github.com/FiloSottile/mkcert"
  exit 1
fi

# Create certs directory
CERTS_DIR="$(pwd)/certs"
mkdir -p "$CERTS_DIR"

# Check if the certs already exist
if [ -f "$CERTS_DIR/puzzles.local.pem" ] && [ -f "$CERTS_DIR/puzzles.local-key.pem" ]; then
  echo -e "${YELLOW}Certificates already exist in ${CERTS_DIR}${NC}"
  read -p "Do you want to regenerate them? (y/n): " -n 1 -r
  echo ""
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}Skipping certificate generation.${NC}"
    exit 0
  fi
fi

# Install the local CA if needed
echo -e "${BLUE}Installing mkcert root CA...${NC}"
mkcert -install

# Generate certificate for all domains
echo -e "${BLUE}Generating certificates for domains:${NC}"
for DOMAIN in "${DOMAINS[@]}"; do
  echo -e "  - ${BOLD}$DOMAIN${NC}"
done

# Change to certs directory
cd "$CERTS_DIR"

# Create the certificate
mkcert "${DOMAINS[@]}"

# Rename the certificate files to a standard name
mv "${DOMAINS[0]}+$(( ${#DOMAINS[@]} - 1 )).pem" puzzles.local.pem
mv "${DOMAINS[0]}+$(( ${#DOMAINS[@]} - 1 ))-key.pem" puzzles.local-key.pem

# Create links for Traefik
ln -sf puzzles.local.pem cert.pem
ln -sf puzzles.local-key.pem key.pem

echo ""
echo -e "${GREEN}✓ Certificates generated successfully!${NC}"
echo -e "${YELLOW}Files created:${NC}"
ls -l "$CERTS_DIR"
echo ""
echo -e "${BLUE}These certificates are now ready for use with Traefik in your local development environment.${NC}"
echo -e "${YELLOW}The certificates will be mounted into the Traefik container via:${NC}"
echo -e "  ${BOLD}./certs:/etc/traefik/certs${NC}"
echo ""
echo -e "${BLUE}===============================================${NC}"
#!/bin/bash
set -e

# Function to print colored output
function print_status() {
  local color=$1
  local message=$2
  case $color in
    "green") echo -e "\033[0;32m$message\033[0m" ;;
    "red") echo -e "\033[0;31m$message\033[0m" ;;
    "yellow") echo -e "\033[0;33m$message\033[0m" ;;
    "blue") echo -e "\033[0;34m$message\033[0m" ;;
    "magenta") echo -e "\033[0;35m$message\033[0m" ;;
    "cyan") echo -e "\033[0;36m$message\033[0m" ;;
    *) echo "$message" ;;
  esac
}

# Navigate to project root
cd "$(dirname "$0")/.."
PROJECT_ROOT=$(pwd)

# Display welcome message
print_status "magenta" "
=================================================
   🌊 Ocean of Puzzles - Development Launcher
=================================================
"

# Show menu
print_status "blue" "Select a development mode:"
print_status "cyan" "1) Standard Mode - Simple concurrent development"
print_status "cyan" "2) Enhanced Mode - With detailed logging and error tracking"
print_status "cyan" "3) Check & Run - Run checks first, then start with enhanced logging"
print_status "cyan" "4) Frontend Only - Run only the frontend"
print_status "cyan" "5) Backend Only - Run only the backend"
print_status "cyan" "q) Quit"

# Read user choice
read -p "Enter your choice [1-5 or q]: " choice

case $choice in
  1)
    print_status "green" "Starting standard development mode..."
    npm run dev
    ;;
  2)
    print_status "green" "Starting enhanced development mode with logging..."
    ./scripts/dev-with-logs.sh
    ;;
  3)
    print_status "green" "Running checks and then starting development..."
    ./scripts/check-builds.sh && ./scripts/dev-with-logs.sh
    ;;
  4)
    print_status "green" "Starting frontend only..."
    cd frontend && npm run dev
    ;;
  5)
    print_status "green" "Starting backend only..."
    cd backend && npm run dev
    ;;
  q|Q)
    print_status "yellow" "Exiting..."
    exit 0
    ;;
  *)
    print_status "red" "Invalid option. Exiting."
    exit 1
    ;;
esac
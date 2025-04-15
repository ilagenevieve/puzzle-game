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

# Enable error handling
function handle_error() {
  print_status "red" "Error occurred in dev-with-logs.sh at line $1"
  exit 1
}
trap 'handle_error $LINENO' ERR

# Set working directory to project root
cd "$(dirname "$0")/.."
PROJECT_ROOT=$(pwd)

# Create logs directory
mkdir -p logs

# Function to start a component
function start_component() {
  local name=$1
  local command=$2
  local log_file="logs/${name}.log"
  
  # Create or truncate log file
  > "$log_file"
  
  print_status "blue" "Starting $name..."
  print_status "yellow" "Logs will be saved to $log_file"
  
  # Start component in background and tee to log file
  (
    cd "$PROJECT_ROOT/$name"
    npm install --no-fund --no-audit &> /dev/null
    eval "$command" 2>&1 | tee -a "$log_file" &
  )
  
  # Add the most recent background job to the list
  if [[ "${COMPONENT_PIDS[*]}" ]]; then
    COMPONENT_PIDS+=($!)
  else
    COMPONENT_PIDS=($!)
  fi
}

# Function to monitor component logs for errors
function monitor_logs() {
  local log_file="logs/$1.log"
  
  # List of error patterns to watch for
  error_patterns=(
    "Error:"
    "error:"
    "TypeError:"
    "SyntaxError:"
    "ReferenceError:"
    "Cannot find"
    "Failed to"
    "Uncaught exception"
    "ERR!"
    "Unhandled rejection"
    "Unhandled Promise rejection"
  )
  
  # Join patterns with OR operator
  pattern=$(IFS="|"; echo "${error_patterns[*]}")
  
  # Use tail to follow the log file and grep to find errors
  tail -f "$log_file" | grep -E "$pattern" --color=always &
  MONITOR_PIDS+=($!)
}

# Function to be called on script exit
function cleanup() {
  print_status "yellow" "Shutting down all components..."
  
  # Kill all component processes
  for pid in "${COMPONENT_PIDS[@]}"; do
    if ps -p "$pid" > /dev/null; then
      kill "$pid" 2>/dev/null || true
    fi
  done
  
  # Kill all monitoring processes
  for pid in "${MONITOR_PIDS[@]}"; do
    if ps -p "$pid" > /dev/null; then
      kill "$pid" 2>/dev/null || true
    fi
  done
  
  print_status "green" "All components have been shut down."
  exit 0
}

# Register cleanup function
trap cleanup EXIT INT TERM

# Array to hold all component PIDs
COMPONENT_PIDS=()
MONITOR_PIDS=()

# Display welcome message
print_status "magenta" "
=================================================
   🌊 Ocean of Puzzles - Development Environment
=================================================
"

# Start backend
start_component "backend" "NODE_ENV=development npm run dev"

# Wait a moment to let backend initialize
sleep 2

# Start frontend
start_component "frontend" "npm run dev"

# Wait a moment for processes to start and logs to be created
sleep 3

# Display active components
print_status "green" "All components started successfully!"
print_status "blue" "
=================================================
   🌊 Active Components:
   - Backend: http://localhost:4000
   - Frontend: http://localhost:3000
=================================================
"

# Start monitoring logs for errors
print_status "yellow" "Monitoring logs for errors..."
monitor_logs "backend"
monitor_logs "frontend"

# Display error log information
print_status "yellow" "
=================================================
   📝 Full logs are available in the logs directory:
   - Backend: logs/backend.log
   - Frontend: logs/frontend.log
=================================================
"

print_status "cyan" "Press Ctrl+C to shut down all components."

# Wait for all component processes to finish
wait ${COMPONENT_PIDS[@]}
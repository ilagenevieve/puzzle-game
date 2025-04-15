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
mkdir -p "$PROJECT_ROOT/logs"
chmod 755 "$PROJECT_ROOT/logs"

# Check if node and npm are installed
function check_prerequisites() {
  print_status "blue" "Checking prerequisites..."
  
  if ! command -v node &> /dev/null; then
    print_status "red" "❌ Node.js is not installed or not in PATH. Please install Node.js first."
    exit 1
  fi
  
  if ! command -v npm &> /dev/null; then
    print_status "red" "❌ npm is not installed or not in PATH. Please install npm first."
    exit 1
  fi
  
  local node_version=$(node -v)
  local node_major_version=$(echo $node_version | cut -d. -f1 | tr -d 'v')
  local npm_version=$(npm -v)
  print_status "green" "✅ Found Node.js $node_version and npm $npm_version"
  
  # Check Node.js version - display version info only
  if [ "$node_major_version" -ge "18" ]; then
    print_status "green" "✅ Using Node.js $node_version"
    print_status "blue" "ℹ️ All modern Node.js versions are now supported"
    print_status "blue" "ℹ️ LTS versions recommended for production use"
  fi
  
  # Check if both package.json files exist
  if [ ! -f "$PROJECT_ROOT/frontend/package.json" ]; then
    print_status "red" "❌ Frontend package.json not found at $PROJECT_ROOT/frontend/package.json"
    exit 1
  fi

  if [ ! -f "$PROJECT_ROOT/backend/package.json" ]; then
    print_status "red" "❌ Backend package.json not found at $PROJECT_ROOT/backend/package.json"
    exit 1
  fi
  
  print_status "green" "✅ Project structure looks correct"
}

# Function to start a component with timeout and status check
function start_component() {
  local name=$1
  local command=$2
  local timeout=${3:-30}  # Default 30 seconds timeout
  local log_file="$PROJECT_ROOT/logs/${name}.log"
  local error_file="$PROJECT_ROOT/logs/${name}_error.log"
  local pid_file="$PROJECT_ROOT/logs/${name}.pid"
  
  # Create or truncate log files
  > "$log_file"
  > "$error_file"
  
  print_status "blue" "Starting $name..."
  print_status "yellow" "Logs will be saved to $log_file"
  
  # Check if directory exists
  if [ ! -d "$PROJECT_ROOT/$name" ]; then
    print_status "red" "❌ $name directory not found at $PROJECT_ROOT/$name"
    return 1
  fi
  
  # Check if node_modules exists, if not install dependencies with a timeout
  if [ ! -d "$PROJECT_ROOT/$name/node_modules" ]; then
    print_status "yellow" "📦 Installing $name dependencies (this may take a moment)..."
    (
      cd "$PROJECT_ROOT/$name"
      npm install --no-fund --no-audit > "$log_file" 2> "$error_file" || echo "NPM install failed" > "$error_file"
      
      # Check if nodemon is needed and install globally if not present
      if [ "$name" = "backend" ] && ! command -v nodemon &> /dev/null; then
        print_status "yellow" "📦 Installing nodemon globally (required for backend)..."
        npm install -g nodemon >> "$log_file" 2>> "$error_file" || echo "Nodemon install failed" >> "$error_file"
      fi
    )
    
    # Check for errors in npm install
    if [ -s "$error_file" ]; then
      print_status "red" "❌ Failed to install $name dependencies. See $error_file for details."
      cat "$error_file"
      return 1
    fi
    
    print_status "green" "✅ $name dependencies installed successfully"
  fi
  
  # Start component in background and tee to log file
  (
    cd "$PROJECT_ROOT/$name"
    eval "$command" 2>&1 | tee -a "$log_file" &
    echo $! > "$pid_file"
  )
  
  # Get the PID
  if [ -f "$pid_file" ]; then
    local pid=$(cat "$pid_file")
    if [[ "${COMPONENT_PIDS[*]}" ]]; then
      COMPONENT_PIDS+=($pid)
    else
      COMPONENT_PIDS=($pid)
    fi
  else
    print_status "red" "❌ Failed to get PID for $name"
    return 1
  fi
  
  # Wait for startup indications with timeout
  print_status "yellow" "Waiting for $name to start (timeout: ${timeout}s)..."
  
  local start_time=$(date +%s)
  local current_time=$(date +%s)
  local success=false
  
  while (( current_time - start_time < timeout )); do
    if [ "$name" = "backend" ] && grep -q "Server running" "$log_file"; then
      success=true
      break
    elif [ "$name" = "frontend" ] && grep -q "Local:" "$log_file"; then
      success=true
      break
    fi
    
    # Check for common errors
    if grep -q "Error:" "$log_file" || grep -q "ERR!" "$log_file"; then
      print_status "red" "❌ Error detected while starting $name:"
      grep -E "Error:|ERR!" "$log_file" | head -n 3
      return 1
    fi
    
    sleep 1
    current_time=$(date +%s)
  done
  
  if [ "$success" = true ]; then
    print_status "green" "✅ $name started successfully!"
    return 0
  else
    print_status "red" "❌ Timeout waiting for $name to start. Check $log_file for details."
    print_status "yellow" "Last 10 lines of log:"
    tail -n 10 "$log_file"
    return 1
  fi
}

# Function to monitor component logs for errors
function monitor_logs() {
  local log_file="$PROJECT_ROOT/logs/$1.log"
  
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

# Display welcome message with ocean theme
print_status "blue" "~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~"
cat << 'EOF' | while read -r line; do print_status "cyan" "$line"; done
   🐙   🐠         🐬         🐚   🐟      
  ≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈
      🌊  OCEAN OF PUZZLES DEV  🌊
  ≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈
EOF
print_status "blue" "~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~"
print_status "blue" "
 ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~
    🌊 Ocean of Puzzles - Development Environment
 ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~
"

# Check prerequisites
check_prerequisites
print_status "blue" "Starting development environment..."

# Initialize a flag to track if everything starts correctly
ALL_STARTED=true

# Start backend with a timeout of 30 seconds
if ! start_component "backend" "NODE_ENV=development npm run dev" 30; then
  print_status "red" "❌ Failed to start backend component."
  ALL_STARTED=false
else
  # Get backend port from config or default to 4000
  BACKEND_PORT=4000
  if grep -q "PORT" "$PROJECT_ROOT/backend/.env" 2>/dev/null; then
    BACKEND_PORT=$(grep "PORT" "$PROJECT_ROOT/backend/.env" | cut -d'=' -f2)
  fi
  print_status "green" "✅ Backend started at http://localhost:$BACKEND_PORT"
fi

# Only start frontend if backend started
if [ "$ALL_STARTED" = true ]; then
  # Start frontend with a timeout of 60 seconds (Vite can take longer)
  if ! start_component "frontend" "npm run dev" 60; then
    print_status "red" "❌ Failed to start frontend component."
    ALL_STARTED=false
  else
    # Get frontend port from config or default to 3000
    FRONTEND_PORT=3000
    if grep -q "FRONTEND_PORT" "$PROJECT_ROOT/frontend/.env" 2>/dev/null; then
      FRONTEND_PORT=$(grep "FRONTEND_PORT" "$PROJECT_ROOT/frontend/.env" | cut -d'=' -f2)
    fi
    print_status "green" "✅ Frontend started at http://localhost:$FRONTEND_PORT"
  fi
fi

# Only proceed if all components started
if [ "$ALL_STARTED" = true ]; then
  # Display active components with ocean theme
  print_status "green" "✅ All components started successfully!"
  
  cat << EOF | sed 's/\\n/\n/g' | while read -r line; do print_status "blue" "$line"; done
  ~^~^~^~^~^~^~^~^~^~^~^~^~
EOF
  print_status "blue" "   🌊 Active Components:"
  print_status "blue" "   🐚 Backend: http://localhost:$BACKEND_PORT"
  print_status "blue" "   🐙 Frontend: http://localhost:$FRONTEND_PORT" 
  
  cat << EOF | sed 's/\\n/\n/g' | while read -r line; do print_status "blue" "$line"; done
  ~^~^~^~^~^~^~^~^~^~^~^~^~
EOF

  # Start monitoring logs for errors
  print_status "yellow" "📊 Monitoring logs for errors..."
  monitor_logs "backend"
  monitor_logs "frontend"

  # Display error log information with ocean theme
  cat << 'EOF' | while read -r line; do print_status "magenta" "$line"; done
  🧜‍♀️ Log Files Available 📝
  ≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈
   🐚 🐚 🐚 🐚 🐚 🐚 🐚
EOF
  print_status "yellow" "
 ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~
   📝 Full logs are available in the logs directory:
   🐬 Backend: $PROJECT_ROOT/logs/backend.log
   🐟 Frontend: $PROJECT_ROOT/logs/frontend.log
 ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~
"

  print_status "cyan" "🦀 Press Ctrl+C to swim away and shut down all components."

  # Wait for all component processes to finish
  wait ${COMPONENT_PIDS[@]}
else
  print_status "red" "
=================================================
   ❌ Failed to start all components
   Please check the logs for more information
=================================================
"
  cleanup
  exit 1
fi
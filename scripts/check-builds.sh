#!/bin/bash

# Don't use set -e so we can handle errors gracefully and provide better feedback
# set -e

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

# Function to handle steps with better error reporting
function run_step() {
  local step_name=$1
  local command=$2
  local error_message=$3
  
  print_status "yellow" "Running $step_name..."
  
  # Create a temporary file for command output
  local output_file
  output_file=$(mktemp)
  
  # Run the command and capture its output and exit status
  eval "$command" > "$output_file" 2>&1
  local exit_status=$?
  
  # Check if the command was successful
  if [ $exit_status -eq 0 ]; then
    print_status "green" "✅ $step_name successful!"
    return 0
  else
    print_status "red" "❌ $error_message"
    print_status "red" "Error details:"
    cat "$output_file" | sed 's/^/  /'
    return 1
  fi
}

# Function to check and install dependencies if needed
function check_dependencies() {
  local component=$1
  local dir="$PROJECT_ROOT/$component"
  
  # Check if directory exists
  if [ ! -d "$dir" ]; then
    print_status "red" "❌ $component directory not found at $dir"
    return 1
  fi
  
  # Check if package.json exists
  if [ ! -f "$dir/package.json" ]; then
    print_status "red" "❌ $component package.json not found"
    return 1
  fi
  
  # Check if node_modules exists, install if needed
  if [ ! -d "$dir/node_modules" ]; then
    print_status "yellow" "📦 Installing $component dependencies..."
    
    # Create a temporary file for npm output
    local npm_output
    npm_output=$(mktemp)
    
    (cd "$dir" && npm install $([ "$component" = "frontend" ] && echo "--legacy-peer-deps")) > "$npm_output" 2>&1
    
    if [ $? -ne 0 ]; then
      print_status "red" "❌ Failed to install $component dependencies"
      cat "$npm_output" | sed 's/^/  /'
      return 1
    fi
    
    print_status "green" "✅ $component dependencies installed successfully"
  else
    print_status "green" "✅ $component dependencies already installed"
  fi
  
  return 0
}

# Function to run checks for a component
function check_component() {
  local component=$1
  local dir="$PROJECT_ROOT/$component"
  local success=true
  
  print_status "blue" "=== Checking $component ==="
  
  # Check dependencies
  if ! check_dependencies "$component"; then
    return 1
  fi
  
  # Navigate to component directory
  cd "$dir"
  
  # Run linting if available
  if grep -q "\"lint\"" package.json; then
    if ! run_step "$component linting" "npm run lint" "$component linting failed"; then
      success=false
    fi
  else
    print_status "yellow" "⚠️ No lint script found for $component, skipping"
  fi
  
  # Run type checking if available (especially for frontend)
  if grep -q "\"typecheck\"" package.json; then
    if ! run_step "$component type checking" "npm run typecheck" "$component type checking failed"; then
      success=false
    fi
  else
    print_status "yellow" "⚠️ No typecheck script found for $component, skipping"
  fi
  
  # Run build if available
  if grep -q "\"build\"" package.json; then
    if ! run_step "$component build" "npm run build" "$component build failed"; then
      success=false
    fi
  else
    print_status "yellow" "⚠️ No build script found for $component, skipping"
  fi
  
  # Run tests if available
  if grep -q "\"test\"" package.json; then
    if ! run_step "$component tests" "npm test" "$component tests failed"; then
      success=false
    fi
  else
    print_status "yellow" "⚠️ No test script found for $component, skipping"
  fi
  
  if [ "$success" = true ]; then
    print_status "green" "✅ All $component checks passed!"
    return 0
  else
    print_status "red" "❌ Some $component checks failed"
    return 1
  fi
}

# Navigate to project root
cd "$(dirname "$0")/.."
PROJECT_ROOT=$(pwd)

# Print header
print_status "magenta" "
=================================================
   🌊 Ocean of Puzzles - Build Check System
=================================================
"

# Track overall success
FRONTEND_SUCCESS=false
BACKEND_SUCCESS=false

# Check frontend
if check_component "frontend"; then
  FRONTEND_SUCCESS=true
fi

# Check backend
if check_component "backend"; then
  BACKEND_SUCCESS=true
fi

# Print summary
print_status "magenta" "
=================================================
   🌊 Build Check Summary
=================================================
"

if [ "$FRONTEND_SUCCESS" = true ]; then
  print_status "green" "✅ Frontend: All checks passed!"
else
  print_status "red" "❌ Frontend: Some checks failed"
fi

if [ "$BACKEND_SUCCESS" = true ]; then
  print_status "green" "✅ Backend: All checks passed!"
else
  print_status "red" "❌ Backend: Some checks failed"
fi

if [ "$FRONTEND_SUCCESS" = true ] && [ "$BACKEND_SUCCESS" = true ]; then
  print_status "green" "
=================================================
   ✅ All build checks completed successfully! 
=================================================
"
  exit 0
else
  print_status "red" "
=================================================
   ❌ Some build checks failed - See details above
=================================================
"
  exit 1
fi
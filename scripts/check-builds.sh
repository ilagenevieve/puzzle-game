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
    *) echo "$message" ;;
  esac
}

# Navigate to project root
cd "$(dirname "$0")/.."
PROJECT_ROOT=$(pwd)

print_status "blue" "=== Checking builds for Ocean of Puzzles ==="

# Check frontend build
print_status "blue" "=== Checking frontend build ==="
cd "$PROJECT_ROOT/frontend"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  print_status "yellow" "Installing frontend dependencies..."
  npm install --legacy-peer-deps
fi

# Run linting
print_status "yellow" "Running frontend linting..."
npm run lint || {
  print_status "red" "Frontend linting failed. Please fix the issues."
  exit 1
}

# Run type checking
print_status "yellow" "Running frontend type checking..."
npm run typecheck || {
  print_status "red" "Frontend type checking failed. Please fix the issues."
  exit 1
}

# Run build
print_status "yellow" "Building frontend..."
npm run build || {
  print_status "red" "Frontend build failed. Please fix the issues."
  exit 1
}

print_status "green" "Frontend build checks successful!"

# Check backend build
print_status "blue" "=== Checking backend build ==="
cd "$PROJECT_ROOT/backend"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  print_status "yellow" "Installing backend dependencies..."
  npm install
fi

# Run linting
print_status "yellow" "Running backend linting..."
npm run lint || {
  print_status "red" "Backend linting failed. Please fix the issues."
  exit 1
}

print_status "green" "Backend build checks successful!"

# Run tests
print_status "blue" "=== Running tests ==="

# Run backend tests
cd "$PROJECT_ROOT/backend"
print_status "yellow" "Running backend tests..."
npm test || {
  print_status "red" "Backend tests failed. Please fix the issues."
  exit 1
}

# Run frontend tests
cd "$PROJECT_ROOT/frontend"
print_status "yellow" "Running frontend tests..."
npm test || {
  print_status "red" "Frontend tests failed. Please fix the issues."
  exit 1
}

print_status "green" "All tests passed successfully!"
print_status "green" "=== All build checks completed successfully! ==="
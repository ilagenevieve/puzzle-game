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

# Display welcome message with ocean theme
print_status "blue" "~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~"

cat << 'EOF' | while read -r line; do print_status "cyan" "$line"; done
  🧜‍♀️   🐚   🐬   🌈   🐋   🏝️   🌴   🐡  
  ≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈
     🌊 OCEAN DEV NAVIGATOR 🧭 🌊 
  ≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈
EOF

print_status "blue" "~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~"

print_status "blue" "
   🐳 Ocean of Puzzles - Development Navigator 🧭
 ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~
"

# Show menu with ocean theme
print_status "blue" "🐚 Choose your ocean adventure:"
print_status "cyan" "🌊 1) Calm Waters       - Standard development (frontend + backend)"
print_status "cyan" "🔍 2) Deep Dive         - Enhanced mode with detailed logging"
print_status "cyan" "🧪 3) Treasure Hunter   - Run checks first, then start development"
print_status "cyan" "🏄‍♂️ 4) Surfing           - Frontend only (UI development)"
print_status "cyan" "🐠 5) Coral Reef        - Backend only (API development)"
print_status "cyan" "🏝️  q) Desert Island    - Quit and return to shore"

# Display colorful fish row
cat << 'EOF' | while read -r line; do print_status "magenta" "$line"; done
  ><((°>  <°))><  ><((°>  <°))><  ><((°>
EOF

# Read user choice
read -p "🐙 Enter your choice [1-5 or q]: " choice

case $choice in
  1)
    print_status "green" "🌊 Setting sail on Calm Waters..."
    print_status "blue" "Starting standard development mode..."
    npm run dev
    ;;
  2)
    print_status "green" "🔍 Taking a Deep Dive into the ocean..."
    print_status "blue" "Starting enhanced development mode with detailed logging..."
    ./scripts/dev-with-logs.sh
    ;;
  3)
    print_status "green" "🧪 Hunting for treasure in the deep blue..."
    print_status "blue" "Running quality checks and then starting development..."
    ./scripts/check-builds.sh && ./scripts/dev-with-logs.sh
    ;;
  4)
    print_status "green" "🏄‍♂️ Catching some waves with the frontend..."
    print_status "blue" "Starting frontend only for UI development..."
    cd frontend && npm run dev
    ;;
  5)
    print_status "green" "🐠 Exploring the Coral Reef of the backend..."
    print_status "blue" "Starting backend only for API development..."
    cd backend && npm run dev
    ;;
  q|Q)
    cat << 'EOF' | while read -r line; do print_status "yellow" "$line"; done
    🏝️ Returning to shore. Have a relaxing day!
    
    🐠  Thanks for swimming with us!  🐬
    
    🌴   🌊   🏖️   🌞   🐚   🦀   🦭
EOF
    exit 0
    ;;
  *)
    print_status "red" "🌋 Uncharted waters! That's not a valid option."
    print_status "yellow" "Please try again with a choice from the menu."
    exit 1
    ;;
esac
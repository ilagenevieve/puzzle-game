#!/bin/bash

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

# Ocean-themed header
print_status "blue" "~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~"
cat << 'EOF' | while read -r line; do print_status "cyan" "$line"; done
  🧹   🌊   🐬   🧽   🐠   🐙   🦪   🐚   
  ≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈
   🌊 OCEAN REMOTE BRANCH CLEANUP 🌊
  ≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈
EOF
print_status "blue" "~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~"

# Make sure we have the latest updates
print_status "yellow" "🌊 Refreshing the ocean currents (fetching updates)..."
git fetch --prune

# List branches that have been merged into develop but are not main or develop
print_status "blue" "🐬 Finding merged remote branches..."

# Get the list of branches merged into develop, excluding main and develop
MERGED_BRANCHES=()
while read -r branch; do
  if [[ -n "$branch" && "$branch" != "origin/main" && "$branch" != "origin/develop" && "$branch" != "origin/HEAD" ]]; then
    # Extract branch name without 'origin/'
    branch_name=${branch#origin/}
    MERGED_BRANCHES+=("$branch_name")
  fi
done < <(git branch -r --merged origin/develop)

# If no branches found, exit
if [ ${#MERGED_BRANCHES[@]} -eq 0 ]; then
  print_status "green" "🌴 No merged remote branches to clean up!"
else
  print_status "cyan" "🧜‍♀️ Found these merged remote branches ready for cleanup:"
  for branch in "${MERGED_BRANCHES[@]}"; do
    print_status "yellow" "   🐚 $branch"
  done
  
  print_status "blue" "Would you like to delete these remote branches? (y/n)"
  read -p "🐙 Your choice: " choice
  
  if [[ "$choice" =~ ^[Yy]$ ]]; then
    for branch in "${MERGED_BRANCHES[@]}"; do
      print_status "yellow" "🌊 Deleting remote branch: $branch"
      if git push origin --delete "$branch"; then
        print_status "green" "✅ Successfully deleted remote branch: $branch"
      else
        print_status "red" "❌ Failed to delete remote branch: $branch"
      fi
    done
  else
    print_status "yellow" "🐠 Remote branch cleanup skipped"
  fi
fi

print_status "blue" "~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~"
cat << 'EOF' | while read -r line; do print_status "green" "$line"; done
  🧼 Remote branch cleanup completed! 🧽
  Your repository is now tidier.
  
  Remember to clean up regularly to prevent branch overflow!
EOF
print_status "blue" "~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~"
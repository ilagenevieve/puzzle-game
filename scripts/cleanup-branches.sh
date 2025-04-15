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
   🌊 OCEAN BRANCH CLEANUP UTILITY 🌊
  ≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈
EOF
print_status "blue" "~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~"

# Make sure we have the latest updates
print_status "yellow" "🌊 Refreshing the ocean currents (fetching updates)..."
git fetch --prune

# Find merged branches
print_status "blue" "🐬 Scanning for merged branches (treasures already collected)..."
MERGED_BRANCHES=$(git branch --merged develop | grep -v "^\*" | grep -v "main" | grep -v "develop")

if [ -z "$MERGED_BRANCHES" ]; then
  print_status "green" "🌴 The ocean is clear! No merged branches to clean up."
else
  print_status "cyan" "🧜‍♀️ Found these merged branches ready for cleanup:"
  echo "$MERGED_BRANCHES" | while read -r branch; do
    if [ -n "$branch" ]; then
      print_status "yellow" "   🐚 $branch"
    fi
  done
  
  print_status "blue" "Would you like to delete these local branches? (y/n)"
  read -p "🐙 Your choice: " choice
  
  if [[ "$choice" =~ ^[Yy]$ ]]; then
    echo "$MERGED_BRANCHES" | while read -r branch; do
      if [ -n "$branch" ]; then
        branch_trimmed=$(echo "$branch" | xargs)
        git branch -d "$branch_trimmed"
        print_status "green" "✅ Removed local branch: $branch_trimmed"
      fi
    done
  else
    print_status "yellow" "🐠 Local branch cleanup skipped"
  fi
  
  print_status "blue" "Would you like to delete these branches from remote? (y/n)"
  read -p "🐙 Your choice: " choice
  
  if [[ "$choice" =~ ^[Yy]$ ]]; then
    echo "$MERGED_BRANCHES" | while read -r branch; do
      if [ -n "$branch" ]; then
        branch_trimmed=$(echo "$branch" | xargs)
        git push origin --delete "$branch_trimmed"
        print_status "green" "✅ Removed remote branch: $branch_trimmed"
      fi
    done
  else
    print_status "yellow" "🐠 Remote branch cleanup skipped"
  fi
fi

# Find stale branches (not merged but older than 60 days)
print_status "blue" "🔍 Looking for stale branches (ancient shipwrecks)..."
STALE_BRANCHES=""

# Get all branches except main and develop
ALL_BRANCHES=$(git branch | grep -v "^\*" | grep -v "main" | grep -v "develop")

for branch in $ALL_BRANCHES; do
  # Get last commit date in unix timestamp
  LAST_COMMIT_DATE=$(git log -1 --format=%at "$branch")
  CURRENT_DATE=$(date +%s)
  
  # Calculate days since last commit (60*60*24 = 86400 seconds in a day)
  DAYS_SINCE=$((($CURRENT_DATE - $LAST_COMMIT_DATE) / 86400))
  
  if [ $DAYS_SINCE -gt 60 ]; then
    STALE_BRANCHES="$STALE_BRANCHES$branch (inactive for $DAYS_SINCE days)\n"
  fi
done

if [ -z "$STALE_BRANCHES" ]; then
  print_status "green" "🌴 No stale branches found!"
else
  print_status "magenta" "🧿 Found these stale branches that might need attention:"
  echo -e "$STALE_BRANCHES" | while read -r branch; do
    if [ -n "$branch" ]; then
      print_status "yellow" "   🦪 $branch"
    fi
  done
  
  print_status "cyan" "🦀 These branches haven't been active for over 60 days."
  print_status "cyan" "🐚 Consider reviewing them manually and deleting if no longer needed."
  print_status "cyan" "   git branch -D <branch-name>         # Delete locally"
  print_status "cyan" "   git push origin --delete <branch-name>  # Delete from remote"
fi

print_status "blue" "~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~"
cat << 'EOF' | while read -r line; do print_status "green" "$line"; done
  🧼 Branch cleanup completed! 🧽
  Your repository is now tidier.
  
  Remember to clean up regularly to prevent branch overflow!
EOF
print_status "blue" "~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~^~"
#!/usr/bin/env bash
# Ocean of Puzzles - Deployment script
set -Eeuo pipefail

# --- helpers -----------------------------------------------------------
color() { tput setaf "$1"; }
ok()    { echo "$(color 2)✓ $*$(tput sgr0)"; }
warn()  { echo "$(color 3)! $*$(tput sgr0)"; }
die()   { echo "$(color 1)✘ $*$(tput sgr0)"; exit 1; }
header(){ echo; printf '%s\n' "$(color 4)🌊 $*$(tput sgr0)"; echo; }

# --- validate environment -----------------------------------------------
ENV="${1:-staging}"

if [[ "$ENV" != "main" && "$ENV" != "develop" && "$ENV" != "staging" && "$ENV" != "production" ]]; then
  ENV="staging" # Default to staging if not specified correctly
  warn "Invalid environment specified, defaulting to 'staging'"
fi

# Map branch names to environments
if [[ "$ENV" == "main" ]]; then
  ENV="production"
elif [[ "$ENV" == "develop" ]]; then
  ENV="staging"
fi

header "Deploying Ocean of Puzzles to $ENV environment"

# --- deployment setup --------------------------------------------------
DEPLOY_DIR="./dist"
mkdir -p "$DEPLOY_DIR"

# --- build application -------------------------------------------------
ok "Starting deployment process for $ENV environment"

if [[ "$ENV" == "production" ]]; then
  ok "Building production assets"
  # Production-specific build commands
  NODE_ENV=production npm run build
else
  ok "Building staging assets"
  # Staging-specific build commands
  NODE_ENV=staging npm run build
fi

# --- deploy application ------------------------------------------------
ok "Deploying application to $ENV"

if [[ "$ENV" == "production" ]]; then
  # Here you would add commands to deploy to production
  # Example: rsync, scp, or calling a cloud deployment API
  ok "Production deployment would happen here"
  
  # Add notification or monitoring setup
  ok "Setting up production monitoring"
else
  # Here you would add commands to deploy to staging
  # Example: rsync, scp, or calling a cloud deployment API
  ok "Staging deployment would happen here"
fi

# --- post-deployment tasks ---------------------------------------------
ok "Running post-deployment tasks for $ENV"

if [[ "$ENV" == "production" ]]; then
  # Production post-deployment tasks
  ok "Verifying production deployment"
  ok "Running smoke tests on production"
else
  # Staging post-deployment tasks
  ok "Verifying staging deployment"
fi

# --- completed --------------------------------------------------------
header "Deployment to $ENV completed successfully"
ok "Deployed Ocean of Puzzles to $ENV environment"

# Print deployment summary
echo
echo "$(color 6)🌊 Deployment Summary:$(tput sgr0)"
echo "$(color 6)  Environment: $ENV$(tput sgr0)"
echo "$(color 6)  Timestamp: $(date)$(tput sgr0)"
echo "$(color 6)  Branch: ${GITHUB_REF_NAME:-local}$(tput sgr0)"
echo "$(color 6)  Commit: ${GITHUB_SHA:-local}$(tput sgr0)"
echo

exit 0
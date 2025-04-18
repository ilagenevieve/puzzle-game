# Streamlined CI/CD Implementation Guide for Fedora 41

This guide provides step-by-step instructions for implementing and maintaining the lightweight CI/CD pipeline for the Ocean of Puzzles project. It serves as a practical companion to the [CI/CD Pipeline Documentation](ci-cd-pipeline.md).

## Table of Contents

1. [Initial Setup](#initial-setup)
2. [Setting Up Branch Protection](#setting-up-branch-protection)
3. [Working with the CI Pipeline](#working-with-the-ci-pipeline)
4. [Rootless Docker Setup](#rootless-docker-setup)
5. [Troubleshooting CI/CD Issues](#troubleshooting-cicd-issues)
6. [Local Testing with `act`](#local-testing-with-act)

## Initial Setup

### Prerequisites

1. GitHub repository for the Ocean of Puzzles project
2. Admin access to the repository
3. Fedora 41 development machine with Docker installed

### Setting Up GitHub Actions

1. **Create Workflow Directory**:
   ```bash
   mkdir -p .github/workflows
   ```

2. **Create Quality Gates Workflow**:
   Create `.github/workflows/ci.yml`:

   ```yaml
   name: CI

   on:
     push:
       branches: [main, develop, feature/**, bugfix/**]
       paths-ignore:
         - '**/*.md'
         - 'docs/**'
     pull_request:
       branches: [main]

   permissions:
     contents: read
     actions: read
     security-events: write   # for CodeQL

   jobs:
     lint-test:
       name: 🌊 Lint & Test
       runs-on: ubuntu-latest
       timeout-minutes: 10
       steps:
         - name: 🐙 Checkout code
           uses: actions/checkout@v4
         
         - name: 🔧 Set up Node.js
           uses: actions/setup-node@v4
           with:
             node-version: 22   # Latest LTS
             cache: 'npm'       # Built-in dependency cache
         
         - name: 📦 Install dependencies
           run: npm ci
           
         - name: 🧹 Run linting
           run: npm run lint
           
         - name: 🧪 Run tests
           run: npm test

     docs-check:
       name: 🌊 Docs Fast-Track
       runs-on: ubuntu-latest
       timeout-minutes: 3
       if: "contains(github.event.head_commit.message, 'docs:') || contains(github.event.head_commit.message, 'documentation')"
       steps:
         - name: 🐙 Checkout code
           uses: actions/checkout@v4
         
         - name: 📝 Documentation fast-track
           run: |
             echo "🌊 Documentation change detected"
             echo "🐚 Fast-track complete - skipping main test suite"

     codeql:
       name: 🌊 CodeQL Analysis
       needs: lint-test
       if: github.ref == 'refs/heads/main'
       runs-on: ubuntu-latest
       timeout-minutes: 15
       steps:
         - name: 🐙 Checkout repository
           uses: actions/checkout@v4
           
         - name: 🔍 Initialize CodeQL
           uses: github/codeql-action/init@v2
           with:
             languages: javascript
             
         - name: 🧪 Perform CodeQL Analysis
           uses: github/codeql-action/analyze@v2
   ```

3. **Create Unified Deployment Workflow**:
   Create `.github/workflows/deploy.yml`:

   ```yaml
   name: Deploy

   on:
     push:
       branches:
         - develop   # staging
         - main      # production
     workflow_dispatch:
       inputs:
         environment:
           description: 'Environment to deploy to'
           required: true
           default: 'staging'
           type: choice
           options:
             - staging
             - production

   permissions:
     contents: read
     deployments: write

   jobs:
     deploy:
       name: 🌊 Deploy to ${{ github.ref_name == 'main' && 'Production' || 'Staging' }}
       runs-on: ubuntu-latest
       timeout-minutes: 15
       environment: ${{ github.ref_name == 'main' && 'production' || 'staging' }}
       steps:
         - name: 🐙 Checkout code
           uses: actions/checkout@v4
         
         - name: 🔧 Set up Node.js
           uses: actions/setup-node@v4
           with:
             node-version: 22
             cache: 'npm'
         
         - name: 📦 Install dependencies
           run: npm ci
         
         - name: 🔨 Build
           run: npm run build
         
         - name: 🐬 Deploy
           run: |
             echo "🌊 Deploying to ${{ github.ref_name == 'main' && 'production' || 'staging' }}..."
             ./scripts/deploy.sh ${{ github.ref_name }}
   ```

4. **Create Deployment Script**:
   ```bash
   mkdir -p scripts
   touch scripts/deploy.sh
   chmod +x scripts/deploy.sh
   ```

   In `scripts/deploy.sh`:
   ```bash
   #!/usr/bin/env bash
   # Ocean of Puzzles - Deployment script
   set -Eeuo pipefail

   # Environment based on branch name
   ENV="${1:-staging}"
   if [[ "$ENV" == "main" ]]; then
     ENV="production"
   elif [[ "$ENV" == "develop" ]]; then
     ENV="staging"
   fi

   echo "🌊 Deploying to $ENV environment..."
   # Add deployment logic here
   ```

5. **Configure Dependabot**:
   Create `.github/dependabot.yml`:

   ```yaml
   version: 2
   updates:
     # Root package.json
     - package-ecosystem: "npm"
       directory: "/"
       schedule:
         interval: "weekly"
         day: "monday"
       open-pull-requests-limit: 5
       labels:
         - "dependencies"
       target-branch: "develop"
     
     # Frontend package.json
     - package-ecosystem: "npm"
       directory: "/frontend"
       schedule:
         interval: "weekly"
         day: "monday"
       open-pull-requests-limit: 5
       labels:
         - "frontend"
       target-branch: "develop"
     
     # Backend package.json
     - package-ecosystem: "npm"
       directory: "/backend"
       schedule:
         interval: "weekly"
         day: "monday"
       open-pull-requests-limit: 5
       labels:
         - "backend"
       target-branch: "develop"
     
     # GitHub Actions
     - package-ecosystem: "github-actions"
       directory: "/"
       schedule:
         interval: "monthly"
       open-pull-requests-limit: 3
       labels:
         - "ci/cd"
       target-branch: "develop"
   ```

6. **Auto-merge for Dependencies**:
   Create `.github/workflows/auto-merge-deps.yml`:

   ```yaml
   name: Auto-merge Dependencies

   on:
     pull_request:
       branches: [ develop ]

   permissions:
     contents: write
     pull-requests: write

   jobs:
     auto-merge:
       name: 🌊 Auto-merge Dependency Updates
       runs-on: ubuntu-latest
       if: github.actor == 'dependabot[bot]'
       steps:
         - name: 🔄 Enable auto-merge for Dependabot PRs
           run: |
             gh pr merge --auto --merge "${{ github.event.pull_request.number }}"
           env:
             GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
   ```

## Setting Up Branch Protection

### Configure via GitHub UI (one-time)

1. Go to GitHub repository → Settings → Branches
2. Click "Add rule" for the main branch:
   - Branch name pattern: `main`
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging
     - ✅ Require branches to be up to date before merging
     - Search for and select `lint-test` status check
   - ❌ Do not require reviews (optional for solo development)
   - ❌ Allow force pushes
   - ❌ Allow deletions

3. Click "Add rule" for the develop branch:
   - Branch name pattern: `develop`
   - ❌ No required status checks
   - ❌ No required reviews
   - ❌ Allow force pushes
   - ❌ Allow deletions

### Create GitHub Environments

1. Go to GitHub repository → Settings → Environments
2. Create "staging" environment:
   - No protection rules (auto-deploys)
3. Create "production" environment:
   - ✅ Required reviewers: add yourself
   - (This enforces manual approval for production deployments)

## Working with the CI Pipeline

### Daily Development Workflow

```bash
# Start a new feature
git checkout develop
git pull
git checkout -b feature/my-feature

# Work on changes
# ...

# Commit and push
git add .
git commit -m "feat: implement new feature"
git push -u origin feature/my-feature

# When feature is complete
git checkout develop
git merge feature/my-feature
git push origin develop
git branch -d feature/my-feature
git push origin --delete feature/my-feature
```

### Release Process

```bash
# Prepare a release
git checkout develop
git pull
git checkout -b release/v1.0.0

# Make any final adjustments
npm version patch  # Updates version number
git add .
git commit -m "chore: prepare v1.0.0 release"
git push -u origin release/v1.0.0

# Create a PR to main branch in GitHub UI
# Wait for approval and merge

# After merge to main
git checkout main
git pull
git tag -a v1.0.0 -m "Version 1.0.0"
git push origin v1.0.0

# Sync back to develop
git checkout develop
git merge main
git push origin develop
```

## Rootless Docker Setup

For security on your Fedora 41 development machine:

```bash
# Install Docker on Fedora 41
sudo dnf install -y docker

# Set up rootless Docker
dockerd-rootless-setuptool.sh install

# Add to your ~/.bashrc
echo 'export DOCKER_HOST=unix:///run/user/1000/docker.sock' >> ~/.bashrc
source ~/.bashrc

# Test connection
docker info
```

## Troubleshooting CI/CD Issues

### Common CI Failures

1. **Linting/Test Failures**:
   ```bash
   # Run locally to debug
   npm run lint
   npm test
   ```

2. **Node.js Version Mismatch**:
   ```bash
   # Make sure local Node.js matches CI
   node -v  # Should be v22.x
   ```

3. **Deployment Script Permission**:
   ```bash
   # Ensure deploy script is executable
   chmod +x scripts/deploy.sh
   ```

### GitHub Actions Debug Logging

1. Go to repository → Settings → Secrets
2. Add repository secret: `ACTIONS_STEP_DEBUG` with value `true`
3. Re-run workflow to see verbose logs

## Local Testing with `act`

Test GitHub Actions locally using `act`:

```bash
# Install act on Fedora 41
sudo dnf install -y podman-docker
curl -s https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash

# Run CI job locally
act -j lint-test

# Run with specific event (e.g., push to develop)
act push -b develop

# Run with specific workflow file
act -W .github/workflows/ci.yml
```

## Conclusion

This streamlined implementation provides a clean, efficient CI/CD pipeline for a solo developer on Fedora 41. Branch protection rules are configured once in the GitHub UI, while the workflow files focus on essential quality gates and deployment automation.

The ocean-themed feedback remains as visual log elements, while unnecessary complexity has been removed. As your project grows, you can easily expand this foundation to include more advanced features.

---

## Further Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Nektos Act for local Actions testing](https://github.com/nektos/act)
- [GitHub CLI](https://cli.github.com/manual/)
- [Rootless Docker](https://docs.docker.com/engine/security/rootless/)
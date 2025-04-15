# Single-Developer Workflow Guide

This is a quick reference guide for the Ocean of Puzzles development workflow, optimized for a single developer. For more detailed information, see [Git Workflow](dev-workflow/git-workflow.md).

## Daily Development Flow (No PR Required)

### 1. Start Work on a New Feature

```bash
# Make sure develop is up to date
git checkout develop
git pull origin develop

# Create a feature branch
git checkout -b feature/my-new-feature

# Do your work and commit regularly
git add .
git commit -m "feat: implement feature xyz"

# Push to remote (first time)
git push -u origin feature/my-new-feature

# Or just push if already set up
git push
```

### 2. Complete and Merge a Feature (Direct Push Method)

```bash
# Make sure your changes are committed
git add .
git commit -m "feat: finalize feature xyz"

# Make sure tests pass locally
npm test

# Switch to develop and merge your changes
git checkout develop
git merge feature/my-new-feature

# Push directly to develop (no PR needed)
git push origin develop

# Clean up feature branch
git branch -d feature/my-new-feature
git push origin --delete feature/my-new-feature
```

### 2b. Alternative: Complete with Pull Request (Optional for Tracking)

```bash
# Create a pull request
gh pr create --title "feat: implement my feature" --body "Description of the feature" --base develop

# Merge the PR
gh pr merge --merge

# Switch back to develop and clean up
git checkout develop
git pull origin develop
git branch -d feature/my-new-feature
```

### 3. Documentation Changes (Simplified Flow)

```bash
# Create a docs branch
git checkout develop
git checkout -b docs/update-xyz

# Make changes and commit
git add .
git commit -m "docs: update xyz documentation"

# Direct merge method (faster)
git checkout develop
git merge docs/update-xyz
git push origin develop

# OR create and merge PR for tracking
gh pr create --title "docs: update xyz documentation" --body "Updated documentation" --base develop
gh pr merge --merge
```

### 4. Bug Fixes

```bash
# Create a bugfix branch
git checkout develop
git checkout -b bugfix/fix-issue

# Fix the bug and commit
git add .
git commit -m "fix: resolve issue with xyz"

# Direct merge method (faster)
git checkout develop
git merge bugfix/fix-issue
git push origin develop

# OR create and merge PR for tracking
gh pr create --title "fix: resolve issue with xyz" --body "Fixed bug in xyz" --base develop
gh pr merge --merge
```

## Release Process

When you're ready to make a release (PR to main is **required**):

```bash
# Create a release branch
git checkout develop
git checkout -b release/v1.0.0

# Finalize (update version numbers, etc.)
git add .
git commit -m "chore: bump version to 1.0.0"

# Run tests and checks locally
npm run check
npm test

# Create PR to main (mandatory for production)
gh pr create --title "chore: release v1.0.0" --body "Release version 1.0.0" --base main

# Wait for CI to pass on GitHub, then merge
gh pr merge --merge

# Tag the release
git checkout main
git pull
git tag -a v1.0.0 -m "Version 1.0.0"
git push origin v1.0.0

# Create GitHub release
gh release create v1.0.0 --title "Version 1.0.0" --notes "Release notes..."

# Merge back to develop (direct merge for speed)
git checkout develop
git pull origin develop
git merge main
git push origin develop
```

## CI/CD Configuration

- **PRs are only required for the main branch** (production)
- Direct pushes to develop branch are allowed (faster for solo development)
- All branches trigger CI checks, but these are informational for develop branch
- Documentation-only changes are auto-detected and fast-tracked
- CI runs linting, type checking, and tests

## Enhanced Ocean-Themed Development Environment

Enjoy the peaceful ocean-themed development experience with colorful marine indicators:

```bash
# Launch the interactive ocean-themed development navigator
npm run start:dev

# Run development with ocean-themed enhanced logging
npm run dev:logs

# Run quality checks first, then launch ocean-themed dev environment
npm run dev:check

# Run just the tests
npm test

# Run linting
npm run lint

# Run type checking
npm run typecheck

# Run all checks with dolphin QA inspector visuals
npm run check
```

The ocean-themed interactive navigator offers multiple development paths:
- 🌊 **Calm Waters** - Standard development (frontend + backend)
- 🔍 **Deep Dive** - Enhanced mode with detailed logging and error tracking
- 🧪 **Treasure Hunter** - Run checks first, then start development
- 🏄‍♂️ **Surfing** - Frontend only for UI development
- 🐠 **Coral Reef** - Backend only for API development

The scripts feature automatic setup and dependency management:
- Auto-creates logs directory with proper permissions
- Detects and installs missing dependencies (including nodemon for backend)
- Provides comprehensive error reporting with log file creation
- Saves detailed logs to help debug any development issues

## Important GitHub CLI Commands

```bash
# Create a PR
gh pr create --title "type: description" --body "Detailed description"

# List PRs
gh pr list

# Check PR status
gh pr status

# View PR details
gh pr view <number>

# Merge a PR
gh pr merge <number> --merge  # Creates a merge commit
gh pr merge <number> --squash # Squashes all commits
gh pr merge <number> --rebase # Rebases commits

# Create a release
gh release create v1.0.0 --title "Version 1.0.0" --notes "Release notes..."
```

## Key Takeaways for Solo Development

1. **Daily Work**: Direct pushes to develop branch are allowed - no PR needed
2. **Production Releases**: PRs to main branch are required to ensure quality
3. **CI/CD**: Automated testing happens on all branches but doesn't block develop
4. **Local Testing**: Use `npm run check` and `npm run dev:logs` for quality assurance
5. **Branch Protection**: Main branch is protected; develop branch is semi-protected

For more detailed information on our Git workflow, branch protection rules, and GitHub configuration, see:
- [Git Workflow](dev-workflow/git-workflow.md)
- [GitHub Configuration](github-configuration.md)
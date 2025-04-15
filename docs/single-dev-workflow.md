# Single-Developer Workflow Guide

This is a quick reference guide for the Ocean of Puzzles development workflow, optimized for a single developer. For more detailed information, see [Git Workflow](dev-workflow/git-workflow.md).

## Daily Development Flow

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

### 2. Complete and Merge a Feature

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

# Create and merge PR in one step
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

# Create and merge PR
gh pr create --title "fix: resolve issue with xyz" --body "Fixed bug in xyz" --base develop
gh pr merge --merge
```

## Release Process

When you're ready to make a release:

```bash
# Create a release branch
git checkout develop
git checkout -b release/v1.0.0

# Finalize (update version numbers, etc.)
git add .
git commit -m "chore: bump version to 1.0.0"

# Create PR to main and merge
gh pr create --title "chore: release v1.0.0" --body "Release version 1.0.0" --base main
gh pr merge --merge

# Tag the release
git checkout main
git pull
git tag -a v1.0.0 -m "Version 1.0.0"
git push origin v1.0.0

# Create GitHub release (optional)
gh release create v1.0.0 --title "Version 1.0.0" --notes "Release notes..."

# Merge back to develop
git checkout develop
gh pr create --title "chore: merge release back to develop" --body "Sync develop with release" --base develop --head main
gh pr merge --merge
```

## CI/CD Notes

- Our CI workflow automatically distinguishes between documentation-only changes and code changes
- Documentation-only PRs can be merged even if traditional CI checks would fail
- For code changes, the system runs linting, type checking, and tests

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

For more detailed information on our Git workflow, branch protection rules, and GitHub configuration, see:
- [Git Workflow](dev-workflow/git-workflow.md)
- [GitHub Configuration](github-configuration.md)
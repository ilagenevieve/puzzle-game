# Git Workflow

This document outlines the Git workflow for the Ocean of Puzzles project.

## Branching Strategy

We follow a modified GitFlow workflow with the following branches:

### Main Branches

- **main**: The production branch. This branch always reflects the code in production.
- **develop**: The integration branch. This is where features are merged before release.

### Supporting Branches

- **feature/**: Feature branches for new functionality. Branch from and merge back to `develop`.
- **bugfix/**: Bug fix branches for addressing issues. Branch from and merge back to `develop`.
- **release/**: Release preparation branches. Branch from `develop` and merge to both `main` and `develop`.
- **hotfix/**: Emergency fixes for production issues. Branch from `main` and merge to both `main` and `develop`.

## Branch Naming Convention

```
<type>/<short-description>
```

Where `<type>` is one of:
- `feature`: New functionality
- `bugfix`: Bug fixes
- `release`: Release preparation
- `hotfix`: Emergency production fixes
- `docs`: Documentation changes only
- `refactor`: Code changes that neither fix a bug nor add a feature

Examples:
- `feature/multiplayer-lobby`
- `bugfix/login-error-handling`
- `release/v1.0.0`
- `hotfix/critical-auth-fix`
- `docs/api-documentation`
- `refactor/game-engine-optimization`

## Workflow Process for Single Developer

### Feature Development

1. **Create Feature Branch**: Branch from `develop`
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/my-feature
   ```

2. **Develop and Commit**: Work on your feature, making regular commits using conventional commits format
   ```bash
   git add .
   git commit -m "feat: add feature XYZ"
   ```

3. **Push to Remote**: Push your branch to backup your work
   ```bash
   git push -u origin feature/my-feature
   ```

4. **Keep Updated**: Regularly update your branch with changes from `develop`
   ```bash
   git checkout develop
   git pull origin develop
   git checkout feature/my-feature
   git merge develop
   ```

5. **Push or Merge Directly**: For `develop` branch, you can push directly or use PR method
   
   **Option A - Direct Push** (faster for solo development):
   ```bash
   # After feature is complete
   git checkout develop
   git merge feature/my-feature
   git push origin develop
   ```
   
   **Option B - Pull Request** (for better tracking and history):
   ```bash
   # Create PR via GitHub CLI
   gh pr create --title "feat: add my feature" --body "Description of the feature" --base develop
   gh pr merge <PR-NUMBER> --merge
   ```

6. **Clean Up**: Delete the feature branch after successful merge
   ```bash
   git checkout develop
   git pull origin develop
   git branch -d feature/my-feature
   git push origin --delete feature/my-feature
   ```

> **Note**: When preparing for production (main branch), a pull request with CI checks is required. This provides a final quality check before changes go live.

### Documentation Changes

For documentation-only changes, we can use a streamlined approach:

1. **Create Documentation Branch**:
   ```bash
   git checkout develop
   git checkout -b docs/update-docs
   ```

2. **Make Changes and Commit**:
   ```bash
   git add .
   git commit -m "docs: update documentation"
   ```

3. **Create and Merge PR**:
   ```bash
   gh pr create --title "docs: update documentation" --body "Updated documentation" --base develop
   gh pr merge <PR-NUMBER> --merge
   ```

### Release Process

1. **Create Release Branch**: Branch from `develop` when ready to prepare a release
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b release/v1.0.0
   ```

2. **Finalize Release**: Make any last-minute fixes, update version numbers, etc.
   ```bash
   # Update version in package.json, etc.
   git add .
   git commit -m "chore: bump version to 1.0.0"
   ```

3. **Run Tests and CI Checks Locally**: 
   ```bash
   # Run the same checks that will run in CI
   npm run check
   npm test
   ```

4. **Create PR to Main** (Required for production):
   ```bash
   # Pull request is required for main branch - this triggers CI checks
   gh pr create --title "chore: release v1.0.0" --body "Release version 1.0.0" --base main
   
   # After CI passes, merge the PR
   gh pr merge <PR-NUMBER> --merge
   ```

5. **Tag the Release**:
   ```bash
   git checkout main
   git pull origin main
   git tag -a v1.0.0 -m "Version 1.0.0"
   git push origin v1.0.0
   ```

6. **Create GitHub Release**:
   ```bash
   gh release create v1.0.0 --title "Version 1.0.0" --notes "Release notes..."
   ```

7. **Merge Back to Develop**:
   ```bash
   git checkout develop
   git pull origin develop
   
   # Direct merge for speed (since this is solo development)
   git merge main
   git push origin develop
   
   # OR create a PR if you prefer a record of the merge
   gh pr create --title "chore: merge release v1.0.0 back to develop" --body "Sync develop with release" --base develop --head main
   gh pr merge <PR-NUMBER> --merge
   ```

### Hotfix Process

1. **Create Hotfix Branch**: Branch from `main` for urgent production fixes
   ```bash
   git checkout main
   git pull origin main
   git checkout -b hotfix/critical-fix
   ```

2. **Fix and Commit**: Make necessary fixes
   ```bash
   git add .
   git commit -m "fix: critical issue XYZ"
   ```

3. **Test Locally**: Verify the fix works
   ```bash
   npm test
   npm run check
   ```

4. **Create PR to Main** (Required for production):
   ```bash
   gh pr create --title "fix: critical issue XYZ" --body "Fixes critical issue" --base main
   
   # After CI passes, merge the PR
   gh pr merge <PR-NUMBER> --merge
   ```

5. **Tag the Hotfix**:
   ```bash
   git checkout main
   git pull origin main
   git tag -a v1.0.1 -m "Hotfix 1.0.1"
   git push origin v1.0.1
   ```

6. **Create GitHub Release**:
   ```bash
   gh release create v1.0.1 --title "Hotfix 1.0.1" --notes "Fixed critical issue XYZ" --prerelease
   ```

7. **Apply to Develop Branch** (Direct merge for solo developer):
   ```bash
   git checkout develop
   git pull origin develop
   git merge main
   git push origin develop
   ```

## Commit Guidelines

### Commit Message Format

```
<type>: <subject>

<body>
```

Where `<type>` is one of:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Formatting, missing semicolons, etc. (no code change)
- `refactor`: Code refactoring (no feature change or bug fix)
- `perf`: Performance improvements
- `test`: Adding or refactoring tests
- `chore`: Maintenance tasks, dependency updates, etc.

Examples:
```
feat: add multiplayer lobby system

Implement real-time lobby with Socket.io integration
```

```
fix: resolve login error with special characters

Users with special characters in their username could not log in
due to improper validation
```

### Commit Best Practices

- Write in present tense ("Add feature" not "Added feature")
- First line should be 50 characters or less
- Second line should be blank
- Reference issue numbers when applicable (e.g., "Fixes #123")
- Be descriptive about why a change was made
- Limit line length to 72 characters in commit message body
- Use bullet points (asterisks or hyphens) for multiple changes

## Pull Request Guidelines for Single Developer

### PR Title Format

```
<type>: <subject>
```

Using the same types as commit messages (feat, fix, docs, etc.).

### PR Description Template

We use a simple PR template stored in `.github/pull_request_template.md`:

```
## Description
Brief description of the changes.

## Type of change
- [ ] Bug fix
- [ ] New feature
- [ ] Enhancement to existing feature
- [ ] Documentation update
- [ ] Code refactoring

## How Has This Been Tested?
Brief description of testing approach.

## Screenshots (if appropriate)

## Checklist
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have added tests where applicable
```

### PR Best Practices for Solo Development

- Keep PRs focused on a single feature or bug fix
- Use the GitHub CLI (`gh pr create`) for creating PRs efficiently
- Include appropriate tests for new features or bug fixes
- Use the PR checklist to ensure quality standards
- Link related issues in the PR description
- Squash commits if there are many small, related changes

### Self-Review Guidelines

As a solo developer, it's important to conduct thorough self-reviews:

- Take a break before reviewing your own code to gain perspective
- Read through the code changes line by line in the GitHub interface
- Run tests and verify functionality before merging
- Use the checklist in the PR template to ensure you've covered all bases
- Document any decisions or trade-offs made in the PR description

## Using Tags

We use tags to mark release versions:

```bash
git tag -a v1.0.0 -m "Version 1.0.0"
git push origin v1.0.0
```

Tag naming follows semantic versioning: `vX.Y.Z`
- `X`: Major version (breaking changes)
- `Y`: Minor version (new features, non-breaking)
- `Z`: Patch version (bug fixes, non-breaking)

## Git Hooks

We use Husky for Git hooks:

- **pre-commit**: Runs linters and formatters on staged files
- **commit-msg**: Validates commit message format
- **pre-push**: Runs tests before pushing to remote

## Handling Merge Conflicts

1. Update your local branches
   ```bash
   git fetch origin
   ```

2. Merge the target branch into your feature branch
   ```bash
   git checkout feature/my-feature
   git merge develop
   ```

3. Resolve conflicts
   ```bash
   # Edit files to resolve conflicts
   git add .
   git commit
   ```

4. Continue with your regular workflow

## GitHub Flow Alternative

For smaller changes or quicker iterations, we may occasionally use a simplified GitHub Flow:

1. Branch from `main`
2. Make changes and test
3. Create PR back to `main`
4. Review and merge directly to `main`

This approach should only be used for documentation changes, simple bug fixes, or when explicitly agreed upon by the team.

## Branch Protection Rules

We have implemented branch protection rules optimized for a single-developer workflow while still maintaining code quality and protecting the production branch.

### 1. Main Branch Protection (Production)

- **Target:** `main` branch
- **Requirements:**
  - Pull request required before merging to ensure code quality
  - Status checks required to pass (lint and tests)
  - Linear history required (no merge commits)
  - Force pushes blocked
  - Branch deletion restricted
  - No required approvals (since we're a single developer)

### 2. Develop Branch Protection (Minimal)

- **Target:** `develop` branch
- **Requirements:**
  - No pull request required before merging (direct push enabled)
  - Force pushes blocked
  - Branch deletion restricted
  - No required status checks (reducing friction)

### 3. Feature/Bugfix/Hotfix Branches (Unrestricted)

- **Target:** All `feature/*`, `bugfix/*`, `hotfix/*` branches
- **Requirements:**
  - No restrictions
  - Full freedom for the solo developer

This optimized configuration:
- Protects the main production branch from errors
- Ensures code quality through CI checks before production releases
- Eliminates unnecessary friction for a solo developer
- Allows for rapid development iterations

Protection rules are automatically applied via GitHub Actions whenever changes are made to the `.github/branch-protection.yml` configuration file.

## Best Practices Summary

- Keep branches short-lived
- Commit frequently with descriptive messages
- Pull from base branches (`develop`/`main`) regularly
- Write meaningful PR descriptions
- Review code thoroughly
- Delete branches after merging
- Use meaningful tags for releases
- Never force push to shared branches
- Automate testing and linting with hooks

## Tools and Resources

- [Git documentation](https://git-scm.com/doc)
- [GitHub documentation](https://docs.github.com/en)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub CLI](https://cli.github.com/) for command-line PR management
- [GitKraken](https://www.gitkraken.com/) or [SourceTree](https://www.sourcetreeapp.com/) for GUI visualization
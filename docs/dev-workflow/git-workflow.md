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

## Workflow Process

### Feature Development

1. **Create Feature Branch**: Branch from `develop`
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/my-feature
   ```

2. **Develop and Commit**: Work on your feature, making regular commits
   ```bash
   git add .
   git commit -m "Add feature XYZ"
   ```

3. **Push to Remote**: Push your branch to share or backup your work
   ```bash
   git push origin feature/my-feature
   ```

4. **Keep Updated**: Regularly update your branch with changes from `develop`
   ```bash
   git checkout develop
   git pull origin develop
   git checkout feature/my-feature
   git merge develop
   ```

5. **Create Pull Request**: When the feature is complete, create a pull request to merge into `develop`

6. **Code Review**: Request review from at least one team member

7. **Merge**: After approval, merge into `develop` using a merge commit
   ```bash
   git checkout develop
   git merge --no-ff feature/my-feature
   git push origin develop
   ```

8. **Clean Up**: Delete the feature branch after successful merge
   ```bash
   git branch -d feature/my-feature
   git push origin --delete feature/my-feature
   ```

### Bug Fixes

Follow the same process as features, but use `bugfix/` prefix for branch names.

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
   git commit -m "Bump version to 1.0.0"
   ```

3. **Merge to Main**: When ready to release, merge to `main` with a version tag
   ```bash
   git checkout main
   git pull origin main
   git merge --no-ff release/v1.0.0
   git tag -a v1.0.0 -m "Version 1.0.0"
   git push origin main --tags
   ```

4. **Merge Back to Develop**: Ensure any release fixes get back to `develop`
   ```bash
   git checkout develop
   git pull origin develop
   git merge --no-ff release/v1.0.0
   git push origin develop
   ```

5. **Clean Up**: Delete the release branch
   ```bash
   git branch -d release/v1.0.0
   git push origin --delete release/v1.0.0
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
   git commit -m "Fix critical issue XYZ"
   ```

3. **Merge to Main**: Apply fix to production
   ```bash
   git checkout main
   git pull origin main
   git merge --no-ff hotfix/critical-fix
   git tag -a v1.0.1 -m "Hotfix 1.0.1"
   git push origin main --tags
   ```

4. **Merge to Develop**: Ensure fix is also in development
   ```bash
   git checkout develop
   git pull origin develop
   git merge --no-ff hotfix/critical-fix
   git push origin develop
   ```

5. **Clean Up**: Delete the hotfix branch
   ```bash
   git branch -d hotfix/critical-fix
   git push origin --delete hotfix/critical-fix
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

## Pull Request Guidelines

### PR Title Format

```
<type>: <subject>
```

Using the same types as commit messages.

### PR Description Template

```
## Description
Brief description of the changes.

## Changes
- Change 1
- Change 2

## Testing
How were the changes tested?

## Screenshots
(if applicable)

## Related Issues
Fixes #123
```

### PR Best Practices

- Keep PRs focused on a single feature or bug fix
- Ensure all tests pass before requesting review
- Include relevant tests for new features or bug fixes
- Request review from appropriate team members
- Link related issues in the PR description
- Squash commits if there are many small, related changes

## Code Review Guidelines

- Reviewers should respond within 24 hours
- Focus on code quality, not style preferences (we have linters for that)
- Be constructive and respectful in comments
- Approve only if you understand the changes
- Suggest improvements rather than just pointing out issues
- Consider both what's present and what's missing

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
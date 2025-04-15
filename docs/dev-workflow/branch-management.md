# Branch Management Guide

This document provides clear guidelines for branch management in the Ocean of Puzzles project.

## Branch Structure

Our project follows a simplified branch structure optimized for solo development:

- **`main`** - Production-ready code (stable, thoroughly tested)
- **`develop`** - Main development branch (current working codebase)
- **Feature branches** - Temporary branches for feature development
- **Bugfix branches** - Temporary branches for bug fixes
- **Doc branches** - Temporary branches for documentation updates

## Primary Branches

### Main Branch (`main`)
- Contains production-ready code
- Protected branch - requires pull requests to merge
- All changes must pass CI/CD checks
- Tagged for releases

### Development Branch (`develop`)
- **This is the main working branch for development**
- **Contains the latest development code**
- **This is what you're testing when running `npm run start:dev`**
- Direct pushes should be allowed for solo developer
- Should be reasonably stable but may contain work-in-progress features

> **Important Note for Solo Developers:**
> GitHub may have repository-wide rules requiring pull requests that override our branch settings.
> To disable this for the develop branch, navigate to:
> GitHub → Repository → Settings → Rules → Edit the rule requiring PRs → Exclude the develop branch

## Working with Temporary Branches

### When to Create a Branch
- For new features: `feature/feature-name`
- For bug fixes: `fix/bug-description`
- For documentation: `docs/topic-name`

### Branch Cleanup
Branches should be deleted after they are merged into `develop`. This keeps the repository clean and focused.

To clean up merged branches:
```bash
# List merged branches
git branch --merged develop

# Delete a local branch
git branch -d branch-name

# Delete a remote branch
git push origin --delete branch-name
```

## Local Development

When developing locally:

1. **Always base new work off the `develop` branch**
2. **Use `npm run start:dev` to test against the current development environment**
3. After testing, merge your changes into `develop`

## Branch Promotion

When ready to release:
1. Create a release branch from `develop`
2. Test thoroughly
3. Create a PR to merge into `main`
4. Tag the release in `main`
5. Merge changes back to `develop`

## Branch Overflow Prevention

To prevent branch overflow:
- Regularly review and delete merged branches
- Stick to the naming conventions above
- Consider using the cleanup script: `scripts/cleanup-branches.sh`
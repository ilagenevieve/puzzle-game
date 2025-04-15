# GitHub Repository Setup

To set up the GitHub repository for this project, follow these steps:

## 1. Create a New Repository on GitHub

1. Go to [GitHub](https://github.com) and log in to your account
2. Click the "+" button in the top right corner and select "New repository"
3. Fill in the repository details:
   - Owner: Your username or organization
   - Repository name: `ocean-of-puzzles` or your preferred name
   - Description: "A mobile browser game with classic mathematical puzzles"
   - Visibility: Choose Public or Private
   - Initialize with: Do not select any options for README, .gitignore, or license

4. Click "Create repository"

## 2. Push Your Local Repository

Once you've created the repository, GitHub will display instructions to push an existing repository. Follow these commands:

```bash
# Set the remote URL (replace 'yourusername' with your GitHub username)
git remote add origin https://github.com/yourusername/ocean-of-puzzles.git

# Verify the remote was added
git remote -v

# Push your branches and tags to GitHub
git push -u origin main
git push -u origin develop
git push --tags
```

## 3. Set Up Branch Protection Rules

After pushing your code, set up branch protection rules:

1. Go to your repository on GitHub
2. Click "Settings" > "Branches"
3. Under "Branch protection rules", click "Add rule"
4. For "Branch name pattern", enter `main`
5. Enable the following protections:
   - ✅ Require pull request reviews before merging
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Include administrators

6. Click "Create" or "Save changes"
7. Repeat for the `develop` branch with similar but potentially less strict rules

## 4. Set Up GitHub Actions

The repository already includes GitHub Actions workflows in the `.github/workflows` directory. These will be automatically activated once you push to GitHub.

## 5. Enable GitHub Issues and Projects

1. Go to your repository on GitHub
2. Click "Settings" > "General"
3. Ensure "Issues" is enabled
4. Consider enabling "Projects" for project management

## 6. Add Repository Topics

Add relevant topics to your repository to improve discoverability:

1. Go to your repository on GitHub
2. Click the "gear" icon next to "About"
3. Add topics like: `puzzle-game`, `svelte`, `phaser`, `nodejs`, `express`, `sqlite`, `educational-game`, `mathematical-puzzles`

## 7. Set Up Branch Default

1. Go to your repository on GitHub
2. Click "Settings" > "Branches"
3. Set the default branch to `develop` for active development

## 8. Add Contributing Guidelines

The repository already includes a CONTRIBUTING.md file with guidelines for contributors. This will be automatically recognized by GitHub.

## 9. Create Initial Project Board

Consider creating a project board to track progress:

1. Go to your repository on GitHub
2. Click "Projects" > "New project"
3. Choose a template (e.g., "Basic Kanban")
4. Set up columns like "To Do", "In Progress", "Review", and "Done"
5. Add initial issues for upcoming features

## 10. Configure Notifications

Configure your notification preferences:

1. Go to your repository on GitHub
2. Click "Watch" dropdown
3. Select your preferred notification level
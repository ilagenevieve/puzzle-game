# GitHub Repository Configuration

This document outlines the configuration steps taken for the Ocean of Puzzles GitHub repository.

## Branch Protection Rulesets

Five branch protection rulesets have been configured:

1. **Main Branch Protection** (Strictest)
2. **Develop Branch Protection** (Strict)
3. **Feature Branches** (Flexible)
4. **Bugfix Branches** (Flexible)
5. **Release Branches** (Moderately Strict)

See the [Git Workflow](dev-workflow/git-workflow.md) document for specific settings details.

## Additional Required GitHub Configuration Steps

The following steps need to be completed in the GitHub UI:

### 1. Create Issue Labels

Navigate to **Issues > Labels** and create the following labels:

| Label Name | Color | Description |
|------------|-------|-------------|
| `bug` | `#d73a4a` | Something isn't working |
| `enhancement` | `#a2eeef` | New feature or enhancement |
| `documentation` | `#0075ca` | Documentation updates |
| `good first issue` | `#7057ff` | Good for newcomers |
| `help wanted` | `#008672` | Extra attention is needed |
| `phase:foundation` | `#cccccc` | Related to Phase 1 - Foundation |
| `phase:authentication` | `#cccccc` | Related to Phase 2 - Authentication |
| `phase:game-engine` | `#cccccc` | Related to Phase 3 - Game Engine |
| `phase:games` | `#cccccc` | Related to Phase 4 - Game Implementations |
| `phase:multiplayer` | `#cccccc` | Related to Phase 5 - Multiplayer |
| `phase:ai` | `#cccccc` | Related to Phase 6 - AI Opponents |
| `phase:polish` | `#cccccc` | Related to Phase 7 - Final Polish |
| `phase:deployment` | `#cccccc` | Related to Phase 8 - Deployment |

### 2. Create Project Board

1. Navigate to **Projects** in the repository
2. Click **New project**
3. Choose **Board** template
4. Name it: "Ocean of Puzzles Development"
5. Configure columns:
   - **To Do**: Issues to be worked on
   - **In Progress**: Active development work
   - **Review**: Pull requests under review
   - **Done**: Completed tasks

### 3. Set Repository Topics

1. Go to the main repository page
2. Find the **About** section on the right side
3. Click the gear icon
4. Add these topics:
   - `puzzle-game`
   - `svelte`
   - `phaser`
   - `express`
   - `node`
   - `sqlite`
   - `mathematical-puzzles`
   - `educational-game`
   - `webrtc`
   - `socketio`

### 4. Configure Repository Settings

1. Go to **Settings > General**
   - Enable **Discussions**
   - Enable **Sponsorships** (optional)
   - Configure **Social preview** with a project image

2. Go to **Settings > Actions > General**
   - Set **Workflow permissions** to "Read and write permissions"
   - Check "Allow GitHub Actions to create and approve pull requests"

3. Go to **Settings > Pages**
   - Set up GitHub Pages for documentation (optional)
   - Source: Deploy from a branch
   - Branch: `main` and `/docs` folder

### 5. Create Initial Issues

Create issues for upcoming development work:

1. **Phaser Integration**
   - Title: "Integrate Phaser 3 with Svelte frontend"
   - Labels: `enhancement`, `phase:game-engine`
   - Project: Ocean of Puzzles Development

2. **Game Container Component**
   - Title: "Create reusable game container component"
   - Labels: `enhancement`, `phase:game-engine`
   - Project: Ocean of Puzzles Development

3. **Nim Game Implementation**
   - Title: "Implement basic Nim game mechanics"
   - Labels: `enhancement`, `phase:games`
   - Project: Ocean of Puzzles Development

### 6. Create Milestone for Phase 3

1. Go to **Issues > Milestones**
2. Click **New milestone**
3. Title: "Phase 3: Game Engine Integration"
4. Due date: Set an appropriate deadline
5. Description: "Integrate Phaser game engine with our Svelte frontend and set up basic game components"

### 7. Configure Dependabot

1. Create a `.github/dependabot.yml` file:
   ```yaml
   version: 2
   updates:
     - package-ecosystem: "npm"
       directory: "/"
       schedule:
         interval: "weekly"
       open-pull-requests-limit: 10
     - package-ecosystem: "npm"
       directory: "/frontend"
       schedule:
         interval: "weekly"
       open-pull-requests-limit: 10
     - package-ecosystem: "npm"
       directory: "/backend"
       schedule:
         interval: "weekly"
       open-pull-requests-limit: 10
   ```

### 8. Set Up CODEOWNERS (Optional)

1. Create a `.github/CODEOWNERS` file:
   ```
   # These owners will be the default owners for everything in the repo
   * @ilagenevieve

   # Frontend code ownership
   /frontend/ @ilagenevieve

   # Backend code ownership
   /backend/ @ilagenevieve

   # Documentation
   /docs/ @ilagenevieve
   ```

### 9. Create a Pull Request Template

1. Create a `.github/pull_request_template.md` file:
   ```markdown
   ## Description
   Please include a summary of the change and which issue is fixed. 
   
   Fixes # (issue)
   
   ## Type of change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Enhancement to existing feature
   - [ ] Documentation update
   - [ ] Code refactoring
   
   ## How Has This Been Tested?
   Please describe the tests that you ran to verify your changes.
   
   ## Screenshots (if appropriate)
   
   ## Checklist
   - [ ] My code follows the style guidelines of this project
   - [ ] I have performed a self-review of my own code
   - [ ] I have commented my code, particularly in hard-to-understand areas
   - [ ] I have made corresponding changes to the documentation
   - [ ] My changes generate no new warnings
   - [ ] I have added tests that prove my fix is effective or that my feature works
   - [ ] New and existing unit tests pass locally with my changes
   ```

After completing these configuration steps, the GitHub repository will be fully set up for a structured, collaborative development process aligned with our implementation plan and Git workflow.
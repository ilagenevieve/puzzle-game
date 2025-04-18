# Streamlined CI/CD Pipeline for Ocean of Puzzles

This document provides an overview of the lightweight CI/CD pipeline for the Ocean of Puzzles project, optimized for a solo developer workflow on Fedora 41.

## Table of Contents

1. [Pipeline Overview](#pipeline-overview)
2. [CI/CD Architecture](#cicd-architecture)
3. [Workflow Configurations](#workflow-configurations)
4. [Branch Strategies](#branch-strategies)
5. [Automated Testing](#automated-testing)
6. [Deployment Process](#deployment-process)
7. [Security Measures](#security-measures)
8. [Local Development](#local-development)
9. [Future Expansion](#future-expansion)

## Pipeline Overview

The Ocean of Puzzles CI/CD pipeline is optimized for a solo developer workflow, balancing quality controls with development speed:

- **Fast Feedback**: Minimized overhead with streamlined workflows and Node.js 22 LTS
- **Fast-track for Docs**: Documentation changes skip intensive testing
- **Solo-friendly Permissions**: Direct pushes to develop branch for daily work
- **Secure Production**: Protected main branch with required PR reviews
- **Automated Security**: Dependabot and CodeQL scanning on main branch
- **Ocean-themed Feedback**: Visual emojis for pleasant developer experience

## CI/CD Architecture

The pipeline uses a minimal set of GitHub Actions workflows:

### Core Components

1. **Quality Gates (`ci.yml`)**: Tests, linting, and type checking
2. **Deployment (`deploy.yml`)**: Single workflow with environment selection
3. **Dependency Updates**: Automated Dependabot with auto-merge for minor versions

### Technology Stack

- **Platform**: GitHub Actions with built-in caching
- **Testing Framework**: Jest, Vitest, Testing Library
- **Linting**: ESLint, Prettier
- **Node.js**: Version 22 LTS only
- **Branch Protection**: Set once via GitHub UI (no workflow)

## Workflow Configurations

### Quality Gates Workflow (`ci.yml`)

A streamlined CI workflow that runs on:
- Pushes to main, develop, feature/**, and bugfix/** branches
- Pull requests to the main branch

Features:
1. **Documentation Fast-track**: Quick processing for doc-only changes
2. **Node.js 22 LTS**: Testing on only the latest LTS version
3. **Dependency Caching**: Built-in npm caching for faster runs
4. **Least-Privilege Permissions**: Only the required access for each job
5. **CodeQL on Main**: Security scanning only where it matters most

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
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22   # Latest LTS
          cache: 'npm'       # Built-in dependency cache
      # ... Testing steps ...
```

### Unified Deployment (`deploy.yml`)

A single workflow that handles both staging and production:

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

jobs:
  deploy:
    name: 🌊 Deploy to ${{ github.ref_name == 'main' && 'Production' || 'Staging' }}
    runs-on: ubuntu-latest
    environment: ${{ github.ref_name == 'main' && 'production' || 'staging' }}
    # ... Deployment steps ...
```

## Branch Strategies

A simplified branch strategy for solo development:

### Branch Types

1. **main**: Production branch with UI-based branch protection
   - Pull requests required
   - Quality gate checks must pass
   - No direct pushes

2. **develop**: Daily development branch with minimal protection
   - Direct pushes allowed
   - Protected from deletion
   - Acts as staging

3. **feature/**, **bugfix/**: Work branches
   - Full flexibility for daily tasks
   - Merged directly to develop when complete

### Merging Approach

1. **Daily Work**: Direct push to develop (no PR required)
2. **Production Releases**: PR from develop to main (required)
3. **Hot Fixes**: PR from bugfix/* directly to main when urgent

## Automated Testing

Simplified but comprehensive testing approach:

### Testing Strategy

- **Unit Tests**: Functions and components
- **Integration Tests**: API endpoints
- **End-to-End Tests**: Critical user flows
- **Single Node Version**: Node.js 22 LTS only
- **Frontend Preprocess Check**: Svelte preprocessor configuration verification

### CI Test Execution

- **Cached Dependencies**: Faster installation with built-in caching
- **Timeouts**: Prevents hanging workflows with 10-minute limits
- **Fast Documentation Path**: Commit message detection for docs-only changes
- **SCSS Verification**: Frontend build step verifies Svelte preprocess configuration
- **Vite Build Cache**: Improved performance with cached Vite build artifacts

## Deployment Process

A streamlined deployment process with environment selection:

### Environment Selection

- Branch-based auto-selection (`main` → production, `develop` → staging)
- Manual trigger with environment selection via workflow_dispatch

### Deployment Script

A single deployment script handles both environments:
```bash
./scripts/deploy.sh ${{ github.ref_name }}
```

## Security Measures

Practical security measures for a solo developer:

### Security Tools

1. **Dependabot**: Weekly vulnerability scanning and dependency updates
2. **CodeQL Analysis**: Runs on main branch pushes only
3. **Branch Protection**: Set once via GitHub UI for main branch

### Least-Privilege Permissions

```yaml
permissions:
  contents: read  # Default minimum access
  actions: read
  security-events: write  # Only where needed
```

## Local Development

Fast local testing that mirrors CI:

### Local Check Command

```bash
# Before committing/pushing
./dev.sh check  # Run linting and tests

# Simulate full CI workflow locally
docker run --rm -v $PWD:/workspace ghcr.io/nektos/act -j lint-test
```

## Future Expansion

As the project grows, the pipeline can be enhanced with:

1. **Matrix Testing by Database**: When adding PostgreSQL alongside SQLite
2. **Self-hosted Runner**: On a mini-PC for faster builds
3. **Canary Deployments**: For staged rollouts to production

---

## Appendix: CI/CD File Structure

```
.github/
├── workflows/
│   ├── ci.yml                 # Quality gates workflow
│   ├── deploy.yml             # Unified deployment workflow
│   ├── auto-merge-deps.yml    # Auto-merge for Dependabot PRs
│   └── dependabot.yml         # Dependency updates config
├── CODEOWNERS                 # Code ownership rules
└── pull_request_template.md   # PR template

scripts/
└── deploy.sh                  # Unified deployment script

docs/
├── ci-cd-pipeline.md          # This document
├── single-dev-workflow.md     # Solo developer workflow
└── dev-workflow/
    ├── branch-management.md   # Branch management guide
    └── testing-standards.md   # Testing standards
```
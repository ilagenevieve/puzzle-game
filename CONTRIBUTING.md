# Contributing to Ocean of Puzzles

Thank you for considering contributing to Ocean of Puzzles! This document outlines the process for contributing to the project.

## Development Setup

1. **Fork and Clone**
   
   ```bash
   git clone https://github.com/yourusername/puzzle-game.git
   cd puzzle-game
   ```

2. **Branch from Develop**
   
   Always create new feature branches from the `develop` branch:
   
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   ```

3. **Install Dependencies**
   
   ```bash
   # Install root dependencies
   npm install
   
   # Install backend dependencies
   cd backend && npm install
   
   # Install frontend dependencies
   cd frontend && npm install
   ```

4. **Set Up Environment**
   
   ```bash
   cp .env.example .env
   # Edit .env with your local settings
   ```

5. **Start Development Environment**
   
   ```bash
   # Using npm scripts
   npm run dev
   
   # Or using Docker
   npm run docker:up
   ```

## Branching Strategy

We follow a simplified GitFlow workflow:

- `main`: Production-ready code
- `develop`: Integration branch for ongoing development
- `feature/*`: New features and non-urgent enhancements
- `bugfix/*`: Bug fixes
- `hotfix/*`: Critical fixes for production
- `release/*`: Release preparation

## Pull Request Process

1. **Create a Pull Request**
   
   When your feature or bugfix is ready, push to your fork and create a pull request to the `develop` branch of the main repository.

2. **PR Description**
   
   Include a clear description of your changes. Reference any related issues using the format `Fixes #123`.

3. **Code Review**
   
   All PRs require at least one review from a maintainer.

4. **CI Checks**
   
   Ensure all CI checks pass. This includes linting, type checking, and tests.

5. **Merging**
   
   Once approved and all checks pass, a maintainer will merge your PR using the squash and merge strategy.

## Commit Guidelines

1. **Commit Message Format**
   
   ```
   <type>: <subject>
   
   <optional body>
   ```
   
   Where `<type>` is one of:
   - `feat`: New feature
   - `fix`: Bug fix
   - `docs`: Documentation changes
   - `style`: Code style changes (formatting, etc.)
   - `refactor`: Code refactoring
   - `test`: Adding or fixing tests
   - `chore`: Maintenance tasks, dependency updates, etc.

2. **Example**:
   
   ```
   feat: add multiplayer lobby component
   
   Implement real-time game lobby with Socket.io integration
   ```

## Code Style

We use ESLint and Prettier to enforce code style. Run these tools before committing:

```bash
npm run lint
```

Our pre-commit hooks should run these checks automatically.

## Testing

All new features should include tests. Run tests with:

```bash
npm test
```

## Documentation

Keep documentation up-to-date when changing code. This includes:

- JSDoc comments for functions and components
- README updates for new features
- Updating the `/docs` directory for architectural changes

## Questions?

If you have any questions, feel free to open an issue tagged with 'question' or reach out to the maintainers directly.

Thank you for contributing to Ocean of Puzzles!
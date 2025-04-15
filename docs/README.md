# Ocean of Puzzles Documentation

This folder contains comprehensive documentation for the Ocean of Puzzles game project.

## Documentation Structure

- **System Architecture**:
  - **[Architecture Overview](architecture.md)**: System architecture and design decisions
  - **[Frontend Architecture](frontend-architecture.md)**: Detailed frontend architecture
  - **[Backend Architecture](backend-architecture.md)**: Detailed backend architecture
  - **[Database Design](database-design.md)**: SQLite schema and relationships
  - **[Authentication](authentication.md)**: Security and authentication design
  - **[API Reference](api.md)**: REST API endpoints and usage

- **Implementation**:
  - **[Implementation Status](../IMPLEMENTATION_STATUS.md)**: Current project progress and roadmap (root-level file)
  - **[Environment Setup](environment-setup.md)**: How to set up development and production environments
  
- **Game Mechanics** *(Planned)*:
  - [Nim](game-mechanics/nim.md): Implementation details for Nim game
  - [Domineering](game-mechanics/domineering.md): Implementation details for Domineering game
  - [Dots and Boxes](game-mechanics/dots-and-boxes.md): Implementation details for Dots and Boxes game

- **Development Workflow**:
  - [Git Workflow](dev-workflow/git-workflow.md): Branching strategy and commit guidelines
  - [Branch Management](dev-workflow/branch-management.md): Clear guidelines on branch structure and cleanup
  - [Code Review](dev-workflow/code-review.md): Code review process and standards
  - [Testing Standards](dev-workflow/testing-standards.md): Testing approach and best practices
  - [Style Guide](dev-workflow/style-guide.md): Code style and linting rules
  - [CI/CD](dev-workflow/ci-cd.md): Continuous integration and deployment
  - [Single Developer Workflow](single-dev-workflow.md): Optimized workflow for solo development

- **API and Integration**:
  - [API Reference](api.md): REST API endpoints and usage
  - [Frontend-Backend Communication](frontend-backend.md): How frontend and backend components interact
  - [Multiplayer](multiplayer.md): PeerJS, Socket.io implementation, and matchmaking
  - [AI Implementation](ai-implementation.md): Design and algorithms for AI opponents
  
- **Component Documentation**:
  - [Game Engine](../frontend/src/game/README.md): Phaser integration and game scene architecture
  - *Additional component READMEs will be linked here as they are created*

- **Deployment** *(Planned)*:
  - [Testing & Deployment](testing-deployment.md): Testing strategies and deployment process
  
- **Release Notes** *(Planned)*:
  - [Changelog](release-notes/changelog.md): Version history and changes
  - [Known Issues](release-notes/known-issues.md): Known bugs and limitations

## Documentation Principles

1. **Documentation in Parallel**: We update documentation alongside code development
2. **Single Source of Truth**: Each topic has one definitive location
   - Implementation Status lives in the repository root as `IMPLEMENTATION_STATUS.md`
   - Technical documentation lives in the `/docs` directory
   - Code-level documentation lives within the code itself
   - Component-specific READMEs provide context for specific modules
3. **Documentation Hierarchy**:
   - Root-level documents provide project-wide information
   - Component-level READMEs provide implementation details and usage examples
   - All component READMEs are referenced from central documentation 
4. **Versioning Strategy**: Documentation is tagged with code releases
5. **Cross-Referencing**: Documentation links to related topics rather than duplicating content
6. **Ocean-Themed Styling**: Consistent ocean-inspired visual language

## Contributing to Documentation

- Use Markdown format for all documentation
- Follow the established style and organization
- Link between documents rather than duplicating content
- Include code examples, diagrams, and visuals when appropriate
- Document both "what" and "why" to provide context

## Getting Started

For new team members, start with the [Environment Setup](environment-setup.md) guide to get your development environment running, then explore the [Architecture](architecture.md) document to understand the system design.
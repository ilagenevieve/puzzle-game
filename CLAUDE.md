# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build/Test Commands
- Build & start dev environment: `docker-compose up --build`
- Run frontend: `cd frontend && npm run dev`
- Run backend: `cd backend && npm run dev`
- Run tests: `npm test`
- Run specific test: `npm test -- -t "test name"`
- Lint code: `npm run lint`
- Type check: `npm run typecheck`

## Code Style Guidelines
- **Formatting**: 2-space indentation, single quotes, no semicolons (Prettier)
- **Naming**: camelCase for variables/functions, PascalCase for components/classes
- **Framework**: Svelte frontend with Phaser 3 game engine, Node.js/Express backend
- **State Management**: Svelte stores with clear separation from UI components
- **Error Handling**: Service layer handles business logic errors, controllers format API responses
- **API Format**: JSON with consistent { success, data, error } structure
- **Documentation**: Document all functions, components, and endpoints with JSDoc
- **Testing**: Unit tests for services, integration tests for API endpoints

## Architecture Notes
- Follow layered architecture: routes → controllers → services → models
- Keep game logic independent of UI implementation
- Ensure mobile-first responsive design in all UI components
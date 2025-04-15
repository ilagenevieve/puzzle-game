# Ocean of Puzzles Architecture

This document outlines the system architecture for the Ocean of Puzzles game.

## Overview

Ocean of Puzzles is built as a modern web application with a clean separation between frontend and backend components. The architecture follows a layered approach with clear boundaries between components.

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│   Frontend      │◄────►   Backend       │◄────►   Database      │
│   (Svelte)      │     │   (Node.js)     │     │   (SQLite)      │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                      │
        │                      │
        ▼                      ▼
┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │
│   Game Engine   │     │  SocketIO       │
│   (Phaser)      │     │  PeerJS Server  │
│                 │     │                 │
└─────────────────┘     └─────────────────┘
```

## Technology Stack

### Frontend
- **Framework**: Svelte + Vite
- **Game Engine**: Phaser 3
- **State Management**: Svelte Stores
- **Routing**: svelte-navigator
- **HTTP Client**: Fetch API
- **Real-time Communication**: Socket.io Client + PeerJS
- **Styling**: SCSS/CSS with BEM methodology
- **Animations**: GSAP
- **Performance**: Web Workers (for AI), Workbox (service worker)

### Backend
- **Runtime**: Node.js
- **Framework**: Express
- **Database**: SQLite (via better-sqlite3)
- **Authentication**: Session-based (express-session + connect-sqlite3)
- **Real-time Communication**: Socket.io, PeerJS Server
- **Validation**: express-validator
- **Logging**: pino

### Database
- **Engine**: SQLite
- **ORM**: None (using better-sqlite3 directly)
- **Migration Strategy**: Manual SQL scripts

### Deployment
- **Containers**: Docker
- **Orchestration**: Docker Compose
- **Reverse Proxy**: Nginx
- **HTTPS**: Let's Encrypt
- **Host**: Proxmox

## Architecture Layers

### Frontend Architecture

The frontend follows a component-based architecture with clear separation of concerns:

1. **Components Layer**: Reusable UI elements
2. **Routes Layer**: Page components and navigation
3. **Stores Layer**: Application state management
4. **Services Layer**: API communication and business logic
5. **Game Layer**: Phaser game engine integration

#### Component Hierarchy

```
App
├── Layout Components (Header, Footer)
├── Page Components (Home, Login, Register, etc.)
│   └── UI Components (Card, Button, Form, etc.)
└── Game Container
    └── Phaser Game Instance
        ├── Scenes (Menu, Game, Pause, etc.)
        └── Game Objects (Board, Pieces, UI, etc.)
```

### Backend Architecture

The backend follows a layered architecture with clear boundaries between components:

1. **Routes Layer**: API endpoints and HTTP methods
2. **Controllers Layer**: Request handling and response formatting
3. **Services Layer**: Business logic and game rules
4. **Models Layer**: Data access and database operations

#### Request Flow

```
Client Request
    │
    ▼
┌────────────┐     ┌────────────┐     ┌────────────┐     ┌────────────┐
│            │     │            │     │            │     │            │
│  Routes    │────►│ Controllers│────►│  Services  │────►│   Models   │
│            │     │            │     │            │     │            │
└────────────┘     └────────────┘     └────────────┘     └────────────┘
    │                   │                  │                  │
    │                   │                  │                  ▼
    │                   │                  │            ┌────────────┐
    │                   │                  │            │            │
    │                   │                  │            │  Database  │
    │                   │                  │            │            │
    │                   │                  │            └────────────┘
    │                   │                  │                  │
    │                   │                  ▼                  │
    │                   │            ┌────────────┐          │
    │                   │            │            │          │
    │                   └───────────►│  Response  │◄─────────┘
    │                                │            │
    └────────────────────────────────►            │
                                     └────────────┘
                                          │
                                          ▼
                                     Client Response
```

## Communication Patterns

### HTTP Communication

- RESTful API with consistent JSON response format
- API versioning in URL path (`/api/v1/`)
- Session-based authentication with HTTP-only cookies
- Standard status codes and error handling

### Real-time Communication

- Socket.io for presence, lobby, and matchmaking
- PeerJS (WebRTC) for direct P2P gameplay
- Fallback to Socket.io if WebRTC connection fails
- Reconnection handling with exponential backoff

## Database Schema

The database uses SQLite with the following core tables:

- **users**: User accounts and authentication
- **game_types**: Available game types and configurations
- **games**: Active and completed games
- **game_players**: Junction table for players in games
- **game_moves**: History of moves in each game
- **user_stats**: User statistics and progress

See [Database Design](database-design.md) for the complete schema.

## Security Considerations

- Authentication via secure HTTP-only cookies
- CSRF protection
- Secure password hashing with bcrypt
- Input validation with express-validator
- Proper error handling to avoid information leakage
- HTTPS for all connections in production
- Content Security Policy for frontend

## Performance Considerations

- Optimized asset delivery for mobile
- GZIP/Brotli compression
- CSS and JS minification
- Code splitting for lazy loading
- Service worker for caching and offline support
- Efficient WebRTC connections for low-latency gameplay
- AI calculations in Web Workers to avoid blocking UI thread

## Design Decisions

### Why Svelte?

Svelte was chosen for its small bundle size, excellent performance on mobile devices, and simpler component model compared to React or Vue. The reactive programming model aligns well with game state management.

### Why Phaser?

Phaser provides a robust game engine with excellent mobile support, WebGL rendering with Canvas fallback, and a comprehensive feature set for 2D games. It handles the complexity of game rendering, input, and physics while integrating well with modern web frameworks.

### Why SQLite?

For a hobby project, SQLite offers simplicity, zero-configuration, and embedded operation without the complexity of a server-based RDBMS. It provides excellent performance for our expected scale while maintaining ACID compliance.

### Why PeerJS/WebRTC?

Direct peer-to-peer connections provide the lowest latency for multiplayer gameplay. By connecting players directly (with Socket.io as fallback), we improve the gaming experience while reducing server load.

## Constraints and Limitations

- Mobile-first design limits UI complexity
- SQLite has concurrency limitations
- WebRTC can be blocked by some firewalls/NATs
- Offline play has limited functionality compared to online
- AI difficulty is constrained by mobile device processing power

## Further Details

- [Frontend Architecture](frontend-architecture.md)
- [Backend Architecture](backend-architecture.md)
- [API Documentation](api.md)
- [Database Design](database-design.md)
- [Multiplayer Implementation](multiplayer.md)
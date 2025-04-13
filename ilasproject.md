# Mobile Browser Puzzle Game: Development Roadmap

## Table of Contents
- [Project Overview](#project-overview)
- [Technology Stack](#technology-stack)
- [Repository Structure](#repository-structure)
- [Backend Architecture](#backend-architecture)
- [Documentation Strategy](#documentation-strategy)
- [Frontend-Backend Communication](#frontend-backend-communication)
- [Development Stages](#development-stages)
  - [Stage 1: Foundation Setup (2-3 weeks)](#stage-1-foundation-setup-2-3-weeks)
  - [Stage 2: Core Authentication & Data Layer (2-3 weeks)](#stage-2-core-authentication--data-layer-2-3-weeks)
  - [Stage 3: Frontend UI Framework (2-3 weeks)](#stage-3-frontend-ui-framework-2-3-weeks)
  - [Stage 4: Game Engine Integration (2-3 weeks)](#stage-4-game-engine-integration-2-3-weeks)
  - [Stage 5: Multiplayer Foundation (MVP Release Candidate) (3-4 weeks)](#stage-5-multiplayer-foundation-mvp-release-candidate-3-4-weeks)
  - [Stage 6: AI Implementation (2-3 weeks)](#stage-6-ai-implementation-2-3-weeks)
  - [Stage 7: Polish & Optimization (2-3 weeks)](#stage-7-polish--optimization-2-3-weeks)
  - [Stage 8: Testing & Deployment (2 weeks)](#stage-8-testing--deployment-2-weeks)
  - [Stage 9: MVP Release & Iteration (Ongoing)](#stage-9-mvp-release--iteration-ongoing)
- [Cross-Cutting Concerns](#cross-cutting-concerns)
- [Development Workflow](#development-workflow)
- [Initial MVP Focus (First 6 Weeks)](#initial-mvp-focus-first-6-weeks)
- [Conclusion](#conclusion)

## Project Overview

**Goal:** Create a mobile-first browser-based puzzle game with classic mathematical games (nim, domineering, dots-and-boxes), featuring 1v1 multiplayer (both P2P and AI opponents), user accounts for progress tracking, and modern visuals with animations.

## Technology Stack

- **Game Engine:** Phaser 3
- **Frontend:** Svelte + Vite
- **Backend:** Node.js + Express
- **Database:** SQLite (via better-sqlite3)
- **Authentication:** Session-based (express-session + connect-sqlite3)
- **Networking:** PeerJS (WebRTC) for direct gameplay, Socket.io for signaling
- **State Management:** Svelte Stores
- **Deployment:** Docker on Proxmox
- **Performance:** GSAP (animations), Web Workers (AI), Workbox (caching)
- **Environment Management:** Docker containers, .env files, pinned dependency versions

## Repository Structure

### Monorepo Layout
```
puzzle-game/
  ├─ .git/                # Git metadata
  ├─ .gitignore
  ├─ README.md
  ├─ docker-compose.yml
  ├─ docker-compose.prod.yml
  ├─ .env.example         # Example env file (never commit real secrets)
  ├─ docs/                # Documentation folder
  │   ├─ README.md        # Overview of documentation structure
  │   ├─ index.md         # Main landing page/table of contents
  │   ├─ architecture.md  # System architecture
  │   ├─ environment-setup.md
  │   └─ ...              # Other documentation files
  ├─ backend/
  │   ├─ Dockerfile
  │   ├─ package.json
  │   ├─ src/
  │   │   ├─ routes/      # API route definitions
  │   │   ├─ middleware/  # Express middleware
  │   │   ├─ controllers/ # Request handlers (thin layer)
  │   │   ├─ services/    # Business logic layer
  │   │   ├─ models/      # Database models & data access
  │   │   ├─ utils/       # Helper functions
  │   │   └─ app.js       # Application entry point
  │   ├─ config/          # Configuration
  │   ├─ db/              # Database files, migrations
  │   └─ tests/           # Test files
  │       ├─ unit/        # Unit tests
  │       ├─ integration/ # Integration tests
  │       └─ e2e/         # End-to-end tests
  └─ frontend/
      ├─ Dockerfile
      ├─ package.json
      ├─ vite.config.js
      ├─ src/
      │   ├─ components/  # Reusable components
      │   ├─ routes/      # Page components
      │   ├─ stores/      # State management
      │   ├─ services/    # API clients & business logic
      │   ├─ assets/      # Static assets
      │   ├─ game/        # Phaser game code
      │   └─ main.js      # Entry point
      ├─ public/          # Static files
      └─ tests/           # Test files
          ├─ unit/        # Unit tests
          └─ e2e/         # End-to-end tests
```

### Environment Management
- All configuration through environment variables
- Development and production environments strictly separated
- Package versions pinned in package.json files
- Docker containers for complete isolation from host system
- Local development via Docker Compose or dedicated Node environments

## Backend Architecture

### Separation of Concerns

The backend follows a layered architecture pattern with clear separation of concerns:

1. **Routes Layer** (`src/routes/`)
   - Defines API endpoints and HTTP methods
   - Maps routes to controller methods
   - Handles request validation through middleware
   - No business logic in this layer

2. **Controllers Layer** (`src/controllers/`)
   - Thin layer focused on HTTP concerns
   - Parses and validates request data
   - Calls appropriate service methods
   - Formats responses and handles status codes
   - Implements proper error handling
   - No direct database access or complex business logic

3. **Services Layer** (`src/services/`)
   - Contains all business logic and domain rules
   - Implements game rules, authentication logic, etc.
   - Coordinates between multiple models if needed
   - Handles complex operations and transactions
   - Independent of HTTP context (no req/res objects)
   - Can be unit tested without HTTP mocking

4. **Models Layer** (`src/models/`)
   - Handles data access and database operations
   - Implements data validation
   - No business logic beyond basic data integrity
   - Encapsulates SQL queries and database structure
   - Provides clean interface for services

### Example Flow

A typical request flows through these layers as follows:

1. **Request** arrives at a route endpoint
2. **Middleware** validates authentication and request format
3. **Route** passes request to appropriate controller
4. **Controller** extracts and validates request data
5. **Service** is called with required parameters
6. **Service** implements business logic, calling models as needed
7. **Models** perform database operations
8. Results flow back through services to the controller
9. **Controller** formats the final response and sends it

### Code Example

**Route Definition**:
```javascript
// src/routes/game-routes.js
const express = require('express');
const { authenticateUser } = require('../middleware/auth');
const gameController = require('../controllers/game-controller');

const router = express.Router();

router.get('/:id', authenticateUser, gameController.getGame);
router.post('/:id/move', authenticateUser, gameController.makeMove);

module.exports = router;
```

**Controller**:
```javascript
// src/controllers/game-controller.js
const gameService = require('../services/game-service');

exports.getGame = async (req, res, next) => {
  try {
    const gameId = req.params.id;
    const userId = req.session.userId;
    
    const game = await gameService.getGameById(gameId, userId);
    
    return res.status(200).json({
      success: true,
      data: { game }
    });
  } catch (error) {
    next(error);
  }
};

exports.makeMove = async (req, res, next) => {
  try {
    const gameId = req.params.id;
    const userId = req.session.userId;
    const { move } = req.body;
    
    const updatedGame = await gameService.makeMove(gameId, userId, move);
    
    return res.status(200).json({
      success: true,
      data: { game: updatedGame }
    });
  } catch (error) {
    next(error);
  }
};
```

**Service**:
```javascript
// src/services/game-service.js
const GameModel = require('../models/game-model');
const UserModel = require('../models/user-model');
const { GameRules } = require('../utils/game-rules');
const { NotFoundError, UnauthorizedError, InvalidMoveError } = require('../utils/errors');

exports.getGameById = async (gameId, userId) => {
  const game = await GameModel.findById(gameId);
  
  if (!game) {
    throw new NotFoundError('Game not found');
  }
  
  if (!game.players.includes(userId)) {
    throw new UnauthorizedError('You are not a player in this game');
  }
  
  return game;
};

exports.makeMove = async (gameId, userId, move) => {
  const game = await this.getGameById(gameId, userId);
  
  // Check if it's the user's turn
  if (game.currentPlayer !== userId) {
    throw new UnauthorizedError('It is not your turn');
  }
  
  // Validate the move using game rules
  if (!GameRules.isValidMove(game.type, game.board, move)) {
    throw new InvalidMoveError('Invalid move');
  }
  
  // Apply the move to the game board
  const updatedBoard = GameRules.applyMove(game.type, game.board, move);
  
  // Check for game completion
  const gameStatus = GameRules.checkGameStatus(game.type, updatedBoard);
  
  // Update the game in the database
  const updatedGame = await GameModel.update(gameId, {
    board: updatedBoard,
    currentPlayer: game.players.find(id => id !== userId), // Switch player
    status: gameStatus.status,
    winner: gameStatus.winner
  });
  
  return updatedGame;
};
```

**Model**:
```javascript
// src/models/game-model.js
const db = require('../db/connection');

exports.findById = async (gameId) => {
  return db.get(`
    SELECT * FROM games WHERE id = ?
  `, [gameId]);
};

exports.update = async (gameId, updates) => {
  const { board, currentPlayer, status, winner } = updates;
  
  return db.run(`
    UPDATE games
    SET board = ?, current_player = ?, status = ?, winner = ?
    WHERE id = ?
    RETURNING *
  `, [JSON.stringify(board), currentPlayer, status, winner, gameId]);
};
```

## Documentation Strategy

### Documentation Format & Tooling

- **Docs-as-Code Approach**
  - All documentation stored in same Git repository as code
  - Markdown format for all documentation files
  - Versioned alongside code using Git tags
  - Static site generator option: MkDocs, Docusaurus, or VitePress

### Documentation Structure

```
docs/
  ├─ README.md                 # High-level overview of the docs folder
  ├─ index.md                  # Main landing page for documentation site
  ├─ architecture.md           # Overall system architecture
  │   ├─ backend-architecture.md  # Detailed backend layers description
  │   └─ frontend-architecture.md # Detailed frontend structure
  ├─ environment-setup.md      # Detailed instructions for environments
  ├─ docker-config.md          # Docker-related instructions
  ├─ database-design.md        # SQLite schema and guidelines
  ├─ authentication.md         # Security and auth design
  ├─ api.md                    # REST API endpoints and usage
  ├─ frontend-backend.md       # Communication between frontend and backend
  ├─ game-mechanics/
  │   ├─ nim.md                # Documentation for nim
  │   ├─ domineering.md        # Documentation for domineering
  │   └─ dots-and-boxes.md     # Documentation for dots-and-boxes
  ├─ multiplayer.md            # PeerJS, Socket.io, matchmaking
  ├─ ai-implementation.md      # AI design and algorithms
  ├─ dev-workflow/
  │   ├─ git-workflow.md       # Git branching strategy and workflow
  │   ├─ code-review.md        # Code review process and guidelines
  │   ├─ testing-standards.md  # Testing expectations and patterns
  │   ├─ style-guide.md        # Code style and linting rules
  │   └─ ci-cd.md              # CI/CD pipeline documentation
  ├─ testing-deployment.md     # Testing, Proxmox deployment
  ├─ logging-monitoring.md     # Logging standards and monitoring
  ├─ user-guide.md             # End-user documentation
  └─ release-notes/
      ├─ changelog.md          # Release summaries
      └─ known-issues.md       # Known issues or limitations
```

### Documentation Principles

1. **Documentation in Parallel**
   - Update docs alongside code development
   - Each development stage has corresponding documentation
   - All key components, APIs, and configurations documented

2. **Single Source of Truth**
   - One definitive location for each topic
   - Cross-reference rather than duplicate information
   - Clear organization so information is easy to find

3. **Versioning Strategy**
   - Documentation tagged with code releases
   - Changelog maintained for each release
   - Deprecated features clearly marked

4. **Ocean-Themed Styling**
   - Soft blue color palette
   - Subtle wave design elements
   - Clean, readable layout
   - Optional CSS customization of static site generator

### Documentation Maintenance

- Regular "doc days" during development
- Update docs with each milestone
- Collect feedback from testers on clarity
- Keep roadmap and documentation in sync

## Frontend-Backend Communication

### REST API Communication

#### API Structure
- **Base URL**: `/api/v1` with versioning in the URL path
- **Response Format**: JSON with consistent structure:
  ```json
  {
    "success": true|false,
    "data": {...} | null,
    "error": null | { "code": "ERROR_CODE", "message": "Human readable message" }
  }
  ```
- **Authentication**: Session-based via HTTP-only cookies
- **Status Codes**: Standard HTTP status codes (200, 201, 400, 401, 403, 500)

#### Session Configuration
- **Cookie Settings**:
  - `HttpOnly`: Yes (prevents JavaScript access)
  - `Secure`: Yes in production, configurable in development
  - `SameSite`: Lax
  - `Domain`: Same domain hosting frontend and backend (e.g., `game.example.com`)
- **Session Lifetime**: 
  - Max Age: 7 days
  - Rolling sessions: Yes (extends on activity)
  - Inactivity timeout: 30 minutes

#### Key API Endpoints

| Endpoint | Method | Description | Request | Response |
|----------|--------|-------------|---------|----------|
| `/api/v1/auth/login` | POST | User login | `{ username, password }` | Session cookie, `{ user: {...} }` |
| `/api/v1/auth/logout` | POST | User logout | None | Destroys session |
| `/api/v1/auth/register` | POST | User registration | `{ username, email, password }` | Session cookie, `{ user: {...} }` |
| `/api/v1/users/me` | GET | Get current user | None | `{ user: {...} }` |
| `/api/v1/games` | GET | List available games | None | `{ games: [...] }` |
| `/api/v1/games/:id` | GET | Get game state | None | `{ game: {...} }` |

#### Authentication Flow
1. User submits login form
2. Frontend posts credentials to `/api/v1/auth/login`
3. On success, server sets `connect.sid` cookie (or similar name)
4. All subsequent requests include this cookie automatically
5. Frontend can store minimal user info in memory but relies on session cookie for auth
6. No sensitive data stored in localStorage or sessionStorage

#### Code Examples

**Backend session setup (Express)**
```javascript
// app.js
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);

app.use(session({
  store: new SQLiteStore({
    db: 'sessions.sqlite',
    dir: './db',
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
}));
```

**Frontend API service (Svelte)**
```javascript
// src/services/api.js
const API_BASE = '/api/v1';

export async function login(username, password) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // Important for cookies
    body: JSON.stringify({ username, password }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Login failed');
  }
  
  return response.json();
}

export async function getCurrentUser() {
  const response = await fetch(`${API_BASE}/users/me`, {
    credentials: 'include',
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      return null; // Not authenticated
    }
    throw new Error('Failed to fetch user');
  }
  
  return response.json();
}
```

### Real-Time Communication

#### Socket.io Implementation

- **Connection**: Authenticated via session cookie
- **Namespace**: `/socket.io`
- **Connection Establishment**:
  1. Frontend connects after successful login
  2. Backend validates session during handshake
  3. User is associated with their socket for presence tracking

**Socket.io server setup**
```javascript
// server.js
const io = require('socket.io')(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? 'https://game.example.com' 
      : 'https://localhost:3000',
    credentials: true,
  },
});

// Session middleware for socket.io
const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);
io.use(wrap(sessionMiddleware));

// Authentication middleware
io.use((socket, next) => {
  const session = socket.request.session;
  if (session && session.userId) {
    socket.userId = session.userId;
    next();
  } else {
    next(new Error('Unauthorized'));
  }
});

io.on('connection', (socket) => {
  // Store user connection in active users
  console.log(`User ${socket.userId} connected`);
  
  // Handle events
  socket.on('join-lobby', handleJoinLobby);
  socket.on('leave-lobby', handleLeaveLobby);
  socket.on('ready-for-match', handleReadyForMatch);
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User ${socket.userId} disconnected`);
    // Clean up user state
  });
});
```

**Socket.io client setup (Svelte)**
```javascript
// src/services/socket.js
import { io } from 'socket.io-client';
import { get, writable } from 'svelte/store';

export const connected = writable(false);
export const gameState = writable(null);

let socket;

export function initializeSocket() {
  socket = io({
    withCredentials: true, // Important for cookies
  });
  
  socket.on('connect', () => {
    connected.set(true);
    console.log('Socket connected');
  });
  
  socket.on('disconnect', () => {
    connected.set(false);
    console.log('Socket disconnected');
  });
  
  socket.on('game-state', (state) => {
    gameState.set(state);
  });
  
  return socket;
}

export function joinLobby(gameType) {
  if (!socket || !get(connected)) return;
  socket.emit('join-lobby', { gameType });
}

export function leaveGame() {
  if (!socket || !get(connected)) return;
  socket.emit('leave-game');
  gameState.set(null);
}
```

#### Socket.io Events

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `join-lobby` | Client → Server | `{ gameType }` | User joins game lobby |
| `leave-lobby` | Client → Server | None | User leaves lobby |
| `ready-for-match` | Client → Server | `{ peerId }` | User ready with PeerJS ID |
| `match-found` | Server → Client | `{ opponentId, gameId, opponentPeerId }` | Match created with opponent |
| `game-state` | Bidirectional | `{ board, turn, ... }` | Game state updates |
| `chat-message` | Bidirectional | `{ message }` | In-game chat |

#### PeerJS Integration

- **Connection Type**: WebRTC via PeerJS
- **Server Location**: Same domain as main app
- **STUN/TURN**: Use public STUN servers, optional TURN fallback
- **Connection Flow**:
  1. Both users connect to PeerJS server, get unique IDs
  2. Users exchange PeerIDs via Socket.io
  3. Direct P2P connection established for game data
  4. Socket.io remains for presence and lobby features

**PeerJS initialization**
```javascript
// src/services/peer.js
import { Peer } from 'peerjs';
import { writable } from 'svelte/store';

export const peerConnected = writable(false);
export const currentPeerId = writable(null);
export const gameConnection = writable(null);

let peer;

export function initializePeer() {
  peer = new Peer({
    host: window.location.hostname,
    path: '/peerjs',
    port: window.location.protocol === 'https:' ? 443 : 3001,
    secure: window.location.protocol === 'https:',
    debug: process.env.NODE_ENV !== 'production' ? 2 : 0,
  });
  
  peer.on('open', (id) => {
    peerConnected.set(true);
    currentPeerId.set(id);
  });
  
  peer.on('error', (err) => {
    console.error('PeerJS error:', err);
    peerConnected.set(false);
  });
  
  return peer;
}

export function connectToPeer(peerId) {
  if (!peer) return null;
  
  const conn = peer.connect(peerId, {
    reliable: true,
  });
  
  conn.on('open', () => {
    gameConnection.set(conn);
  });
  
  conn.on('data', handleGameData);
  
  return conn;
}
```

#### Failure Handling
- **Socket Disconnect**: 
  - Automatic reconnection attempts
  - Rejoin lobby/game on reconnect
  - Store game state locally to resume on reconnection
- **PeerJS Failure**:
  - Fallback to Socket.io for game data if P2P fails
  - TURN server for NAT traversal issues
  - Reconnection attempts with exponential backoff

### Deployment Configuration

#### Production Environment
- **Domain Strategy**: Single domain for all services
  - Frontend: `https://game.example.com/`
  - API: `https://game.example.com/api/`
  - Socket.io: `wss://game.example.com/socket.io/`
  - PeerJS: `wss://game.example.com/peerjs/`
- **Reverse Proxy**: Nginx in front of all containers
- **HTTPS**: Let's Encrypt certificates with auto-renewal

#### Nginx Configuration
```nginx
server {
  listen 443 ssl http2;
  server_name game.example.com;
  
  # SSL configuration
  ssl_certificate /etc/letsencrypt/live/game.example.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/game.example.com/privkey.pem;
  
  # Frontend static files
  location / {
    proxy_pass http://frontend:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }
  
  # API endpoints
  location /api/ {
    proxy_pass http://backend:4000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }
  
  # Socket.io
  location /socket.io/ {
    proxy_pass http://backend:4000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }
  
  # PeerJS
  location /peerjs/ {
    proxy_pass http://backend:9000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }
}
```

### Testing Strategy for Communication

#### Unit Tests
- **API Endpoints**: Test with mocked session
- **Socket Events**: Test event handlers with mocked socket
- **Socket Authentication**: Verify session checks

#### Integration Tests
- **Session Flow**: Complete login/logout cycle
- **API Authorization**: Test protected endpoints with/without session

#### End-to-End Tests
- **Full Authentication Flow**: Registration, login, session persistence
- **Real-time Communication**: Test Socket.io connection and events
- **Game Flow**: Complete game with two browser instances
- **Network Resilience**: Test reconnection after disconnection

## Development Stages

### Stage 1: Foundation Setup (2-3 weeks)

#### Tasks

##### Version Control
- Initialize Git repository
- Set up meaningful branching strategy (e.g., main, develop, feature branches)
- Configure .gitignore for Node, Svelte, and environment files
- Create branch protection for main/develop branches
- Set up pull request templates and contribution guidelines
- Document Git workflow including feature, release, and hotfix processes

##### Documentation Setup
- Create docs folder structure following docs-as-code approach
- Set up initial README.md and index.md
- Document repository structure and conventions
- Create placeholder files for all major documentation sections
- Set up optional static site generator for documentation
- Create architecture documentation with detailed descriptions of layers
- Document code style and review process

##### Environment Isolation & Configuration
- Create comprehensive .env.example file with all required variables
- Document all environment variables and their purpose
- Establish clear separation between development and production environments
- Design environment variable validation strategy
- Set up environment variable loading with secure defaults

##### Docker Configuration
- Create Dockerfile for backend with proper Node version pinning
- Create Dockerfile for frontend with proper Node version pinning
- Develop docker-compose.yml for development environment
- Develop docker-compose.prod.yml for production environment
- Configure Docker networks for service isolation
- Set up Docker volumes for persistent data (SQLite)
- **Critical:** Establish automated SQLite backup strategy for Proxmox

##### Backend Environment
- Configure Express server with basic middleware (cors, compression, etc.)
- Set up logging infrastructure (pino/winston) with structured logging
- Configure log levels and formats for different environments
- Implement configuration management using dotenv
- Configure SQLite database connection with proper error handling
- Set up folder structure with clear separation of layers (routes, controllers, services, models)
- Document the responsibilities of each layer
- Pin all NPM dependencies with exact versions
- Set up testing framework with unit/integration/e2e folder structure

##### Frontend Initialization
- Set up Vite + Svelte project structure
- Configure Vite for development (proxy to backend API)
- Implement basic folder structure following Svelte best practices
- Set up SASS/CSS organization (variables, utilities, components)
- Pin all NPM dependencies with exact versions

##### Integration & DevOps
- Configure development workflow (scripts for starting frontend/backend)
- Set up linting and code formatting (ESLint with Airbnb config, Prettier)
- Configure Husky for pre-commit hooks to enforce standards
- Set up basic CI pipeline with GitHub Actions
- Create comprehensive README with setup instructions
- Create contribution guidelines and PR templates
- Establish local HTTPS setup for WebRTC testing
- Document developer onboarding process
- Set up Docker health checks and monitoring

#### Outcomes
- Fully isolated and reproducible development environment
- Running containerized backend and frontend
- Version-controlled codebase with comprehensive documentation
- Initial documentation structure established
- Properly sandboxed development setup
- Clear separation between host system and development containers

#### Challenges to Consider
- Docker configuration for development vs. production
- Ensuring consistent behavior across environments
- SQLite backup reliability and testing
- Development workflow efficiency
- HTTPS setup for local development (WebRTC requirement)
- Maintaining environment parity between development and production
- Managing environment variables securely
- Keeping documentation updated as the project evolves

### Stage 2: Core Authentication & Data Layer (2-3 weeks)

#### Tasks

##### Database Design
- Design and implement initial database schema (users, game progress)
- Set up SQLite migration strategy (even if manual initially)
- Implement data access layer with proper error handling
- Create seed data for development testing
- Document database schema and relationships in database-design.md
- Set up database access in models layer, separate from business logic
- Create test utilities for database testing

##### Authentication System
- Implement user registration with secure password hashing (bcrypt)
- Set up express-session with connect-sqlite3 store
- Configure secure session parameters (HttpOnly, Secure, SameSite=Lax)
- Implement session lifetime parameters (7-day max, 30-min inactive timeout)
- Create login/logout functionality with proper session management
- Implement middleware for protected routes
- Add CSRF protection if using cookie-based authentication
- Document authentication flow and security measures in authentication.md
- Implement authentication service layer separate from controllers

##### API Foundation
- Design RESTful API structure with versioning (/api/v1)
- Implement consistent JSON response format with success/data/error
- Implement robust input validation (express-validator)
- Create standardized error handling middleware
- Set up basic user profile endpoints
- Implement session-based authentication for API routes
- Document API endpoints and usage in API.md
- Create thin controllers that delegate to service layer
- Set up testing for API endpoints

##### Security Layer
- Add rate limiting for authentication endpoints
- Implement basic request sanitization
- Set up security headers (helmet.js)
- Create security logging for sensitive operations
- Document security measures in security.md

#### Outcomes
- Secure user authentication system
- Well-structured database with backup solution
- Robust API foundation with validation and error handling
- Security best practices implementation

#### Challenges to Consider
- Session management security for mobile browsers
- Efficient validation strategies
- SQLite constraints for concurrent access
- Security without overcomplicating the hobby project

### Stage 3: Frontend UI Framework (2-3 weeks)

#### Tasks

##### Svelte Application Structure
- Implement component structure (layout, pages, shared components)
- Set up routing (svelte-navigator/svelte-routing)
- Create Svelte stores for application state
- Implement responsive layouts using mobile-first approach
- Create frontend service layer for API communication
- Set up proper TypeScript types (if using TypeScript)

##### Authentication UI
- Create login/signup forms with client-side validation
- Implement error display for form validation and API errors
- Design and implement authenticated user state management
- Add session persistence and token refresh logic if needed
- Create user profile screen
- Implement password reset flow (optional)

##### Application Shell
- Build responsive navigation (mobile menu, navigation guards)
- Create placeholder pages for main app sections
- Implement loading states and transitions
- Design basic layout components (headers, footers, cards)
- Create error boundary components
- Implement toast/notification system

##### Accessibility & UX
- Ensure semantic HTML throughout the application
- Implement sufficient color contrast and focus states
- Create error feedback mechanisms
- Test basic keyboard navigation
- Implement touch-friendly UI components
- Set up a11y testing 
- Document frontend architecture and component patterns

#### Outcomes
- Complete application shell with navigation
- Functional authentication flow
- Mobile-responsive layout foundation
- Accessible UI components
- Clear separation between components, stores, and services

#### Challenges to Consider
- Mobile navigation patterns and usability
- Form validation UX on mobile devices
- Touch vs. click interactions
- Varied mobile screen sizes and browsers
- Consistent styling system
- Performance optimization for low-end devices

### Stage 4: Game Engine Integration (2-3 weeks)

#### Tasks

##### Phaser Integration
- Create Phaser container component in Svelte
- Set up communication between Svelte and Phaser
- Implement proper lifecycle management (init/destroy)
- Configure Phaser Scale Manager for mobile responsiveness
- Document the Phaser-Svelte integration pattern

##### Core Game Mechanics
- Implement basic game board rendering
- Create game state management within Phaser
- Design and implement game rules for first puzzle type
- Set up turn-based logic foundation
- Implement touch/pointer controls with fallbacks
- Create game logic in service layer, independent of UI
- Document game rules implementation

##### Asset Management
- Create initial game assets (board, pieces, UI elements)
- Set up efficient asset loading and management
- Implement sprite optimization for mobile
- Design basic animations for game interactions
- Configure asset loading with progress indicators
- Create asset preloading strategy

##### Game UI
- Create in-game UI components (score, turn indicator, etc.)
- Implement game status feedback
- Design game setup and options UI
- Create game result displays
- Implement game instructions/help screens
- Ensure game UI is accessible
- Document game UI components and structure

#### Outcomes
- Functional single-player game prototype
- Responsive game board that works on mobile
- Efficient touch controls
- Basic game flow implementation
- Clear separation between game logic and display

#### Challenges to Consider
- Phaser-Svelte communication pattern efficiency
- Mobile touch interaction precision
- Managing Phaser's Scale Manager for varied devices
- Asset optimization for mobile performance
- Game state management complexity
- Touch event handling on different browsers

### Stage 5: Multiplayer Foundation (MVP Release Candidate) (3-4 weeks)

#### Tasks

##### Socket.io Integration
- Implement Socket.io server on backend
- Create middleware for Socket.io session authentication
- Create Socket.io client connection in frontend
- Set up authentication for socket connections using existing session
- Implement basic presence and game lobby functionality
- Design matchmaking system
- Document Socket.io events and flow in multiplayer.md
- Create Socket.io service in frontend

##### PeerJS Integration
- Set up PeerJS server on same domain as main app
- Configure STUN servers for NAT traversal
- Implement optional TURN server fallback
- Create PeerJS client initialization with proper error handling
- Create connection establishment workflow
- Design connection failure fallbacks (Socket.io as backup)
- Implement reconnection handling with exponential backoff
- Document PeerJS connection flow in frontend-backend.md
- Write tests for connection scenarios

##### Game State Synchronization
- Design synchronization protocol for game states
- Implement state reconciliation for P2P gameplay
- Add validation for incoming game moves
- Create conflict resolution strategies
- Implement local state caching for reconnection
- Document state synchronization approach in multiplayer.md
- Test synchronization with simulated network conditions

##### Multiplayer UI
- Build game lobby and matchmaking UI
- Implement player status indicators
- Create invitation system (if needed)
- Design spectator mode (optional)
- Add network status indicators
- Implement connection quality feedback
- Document UI components and state management in frontend documentation
- Create game abandonment handling

#### Outcomes
- Functional 1v1 multiplayer capability
- Reliable P2P connections with fallbacks
- Game lobby and matchmaking system
- Mobile-friendly network status feedback
- Resilient gameplay during connection issues

#### Challenges to Consider
- WebRTC connection reliability on mobile networks
- NAT traversal issues (STUN/TURN servers)
- Handling mobile background/foreground transitions
- Synchronizing game state efficiently
- Managing player disconnects and reconnections
- Preventing cheating in P2P architecture

### Stage 6: AI Implementation (2-3 weeks)

#### Tasks

##### AI Algorithm Design
- Implement minimax algorithm with alpha-beta pruning
- Design game-specific heuristics for each puzzle type
- Create difficulty levels by adjusting search depth
- Optimize algorithm performance
- Document AI implementation details
- Write tests for AI decision-making

##### Web Worker Integration
- Move AI calculations to Web Workers
- Implement communication between main thread and workers
- Create progress feedback for long calculations
- Handle worker lifecycle and error states
- Test worker performance on different devices
- Document the Web Worker implementation

##### AI UI Integration
- Design UI for AI opponent selection
- Implement difficulty selection
- Create visual feedback for AI "thinking"
- Add AI personality elements (optional)
- Create difficulty balancing controls
- Document AI opponent user experience

##### Offline Play
- Ensure AI works without network connection
- Implement game state persistence for interrupted sessions
- Create offline progress tracking
- Test offline gameplay under various conditions
- Document offline capabilities

#### Outcomes
- Functional AI opponents with multiple difficulty levels
  - Basic difficulty: Fast, may make obvious mistakes
  - Medium: Balance of speed and intelligence
  - Hard: Strong opponent using deeper search
- Smooth user experience during AI calculations
- Offline play capability
- Consistent AI performance across devices

#### Challenges to Consider
- Balancing AI difficulty for enjoyable gameplay
- Performance optimization for mobile devices
- Memory usage during complex calculations
- Worker communication efficiency
- Game-specific heuristic development
- Perceived intelligence vs. actual algorithm complexity

### Stage 7: Polish & Optimization (2-3 weeks)

#### Tasks

##### Visual Polish
- Integrate GSAP for smooth animations
- Implement transition effects between game states
- Add particle effects for game events
- Create cohesive visual style across components
- Optimize animations for performance
- Document animation patterns and best practices

##### Audio Implementation
- Add background music options
- Implement sound effects for game actions
- Create audio controls and mute functionality
- Ensure proper audio handling for mobile devices
- Implement audio context resuming after interruptions
- Document audio implementation details

##### Performance Optimization
- Implement code splitting for lazy loading
- Optimize asset delivery (compression, formats)
- Add Workbox for service worker caching
- Implement resource prefetching for critical assets
- Conduct performance profiling
- Document performance optimizations

##### Mobile Optimization
- Test and optimize touch interactions
- Ensure responsive layout on all target devices
- Optimize battery usage
- Implement progressive loading strategies
- Test and optimize for various network conditions
- Document mobile optimization techniques

#### Outcomes
- Polished, professional-feeling game
- Fast loading and performance on mobile
- Engaging audio-visual feedback
- Battery-efficient implementation
- Smooth gameplay even on lower-end devices

#### Challenges to Consider
- Animation performance on low-end devices
- Audio playback limitations on mobile browsers
- Service worker update strategies
- Battery consumption optimization
- Balancing visual polish with performance
- Handling various device capabilities

### Stage 8: Testing & Deployment (2 weeks)

#### Tasks

##### Testing Implementation
- Write unit tests for critical game logic and service methods
- Implement integration tests for authentication flow
- Create integration tests for API endpoints with session authentication
- Write tests for Socket.io event handlers
- Test PeerJS connection establishment and fallback
- Create end-to-end tests for complete game flow with two players
- Perform cross-browser and cross-device testing
- Set up test coverage reporting in CI pipeline
- Document testing strategy and coverage in testing-deployment.md

##### Production Configuration
- Finalize Docker production configuration
- Set up Nginx reverse proxy with proper routing for all services
- Configure HTTPS with Let's Encrypt certificates
- Set up WebSocket proxy settings for Socket.io and PeerJS
- Configure environment variables for production
- Implement logging and monitoring strategy with structured logs
- Set up log rotation and storage
- Set up basic performance monitoring
- Document production environment in environment-setup.md

##### Deployment Pipeline
- Set up deployment script to Proxmox
- Create database backup and restore procedures with scheduled backups
- Implement version tagging for releases
- Create continuous deployment or deployment checklist
- Set up zero-downtime deployment if possible
- Create rollback procedures for failed deployments
- Document deployment process in testing-deployment.md
- Create release checklist with pre-flight tests
- Implement health check endpoints for services

##### Documentation
- Create user documentation/instructions
- Document codebase architecture focusing on layer responsibilities
- Create maintenance procedures and runbooks
- Document known issues and limitations
- Update frontend-backend.md with final communication details
- Create logging-monitoring.md with details on log formats and viewing
- Publish documentation with ocean-themed styling
- Verify all documentation is complete and accurate
- Create developer onboarding guide

#### Outcomes
- Tested application across target devices
- Secure production environment
  - HTTPS configuration
  - Proper authentication protection
  - Data backup strategy
- Clear deployment and maintenance documentation
- Basic monitoring setup
- Comprehensive test coverage

#### Challenges to Consider
- Diverse mobile browser compatibility
- HTTPS certificate management
- Database backup automation
- Testing WebRTC in various network conditions
- Handling production incidents
- Monitoring performance without adding complexity

### Stage 9: MVP Release & Iteration (Ongoing)

#### Tasks

##### Controlled Release
- Deploy to production environment
- Share with initial test group (daughter and friends)
- Monitor for errors and performance issues
- Collect feedback systematically
- Update documentation based on initial user feedback
- Create process for collecting and organizing feedback

##### Analytics & Monitoring
- Implement basic usage analytics (if desired)
- Set up error tracking
- Monitor server performance
- Track game completion rates
- Document monitoring approach
- Create alerts for critical issues

##### Iterative Improvement
- Prioritize feedback and bug reports
- Implement high-priority fixes
- Add most requested features
- Refine game balance based on playtesting
- Update changelog.md with all changes
- Maintain regular release cadence
- Create roadmap for future improvements

##### Additional Game Types
- Implement remaining puzzle types (nim, dots-and-boxes, etc.)
- Balance AI for new game types
- Create tutorials for each game type
- Extend multiplayer capabilities
- Document new game mechanics in game-mechanics/
- Test new game types thoroughly
- Collect feedback specific to each game type

#### Outcomes
- Functional game in the hands of real users
- Identification of critical improvements
- Prioritized roadmap for future development
- Growing collection of puzzle games
- Iterative improvement process

#### Challenges to Consider
- Balancing user requests with development capacity
- Maintaining motivation for a hobby project
- Scheduling regular updates
- Expanding features without compromising performance
- Managing scope creep
- Balancing new features vs. fixing existing issues

## Cross-Cutting Concerns

### 1. Security
- Validate all input (API, WebSockets, WebRTC messages)
- Use HTTPS for all connections
- Keep dependencies updated (regular npm audit)
- Implement proper authentication checks on all protected routes
- Sanitize user-generated content
- Use secure session configuration (HttpOnly, Secure, SameSite)
- Log security-relevant events
- Ensure proper separation of environments and secrets
- Implement proper socket.io authentication using session
- Validate PeerJS connections against expected users
- Document security measures and considerations

### 2. Environment Management
- Pin all dependency versions exactly in package.json files
- Keep development and production environments strictly separated
- Use Docker containers for complete isolation from host system
- Document all environment variables and their purpose
- Never commit sensitive environment data to version control
- Validate environment variables at application startup
- Create reproducible builds through Docker
- Set up CI/CD pipeline to verify build integrity
- Implement automatic security scans for dependencies

### 3. Documentation
- Follow docs-as-code approach with Markdown files
- Update documentation in parallel with code development
- Maintain single source of truth for all topics
- Version documentation with code releases
- Implement ocean-themed style for documentation site
- Conduct regular documentation reviews
- Create specific documentation for each major component
- Document architecture decisions and layer responsibilities
- Include code examples for key patterns
- Document testing strategy and standards

### 4. Accessibility
- Maintain sufficient color contrast
- Use semantic HTML
- Implement keyboard navigation where appropriate
- Test with screen readers periodically
- Provide alternatives to color-based information
- Ensure touch targets are appropriately sized for mobile
- Follow WCAG 2.1 AA guidelines where reasonable
- Document accessibility features and limitations

### 5. Error Handling & Logging
- Implement consistent error handling patterns
- Create user-friendly error messages
- Log meaningful information for debugging
- Categorize errors appropriately (user error vs. system error)
- Handle network errors gracefully (especially for mobile)
- Implement crash recovery strategies
- Use structured logging format
- Define clear log levels and usage 
- Document common error scenarios and resolutions

### 6. Configuration Management
- Use environment variables for configuration
- Separate development and production settings
- Secure sensitive information (API keys, secrets)
- Document configuration options
- Implement configuration validation
- Provide sensible defaults for non-sensitive configuration
- Create clear examples for required configuration
- Automate environment setup when possible
- Configure proper session parameters
- Set up consistent connection protocols and ports
- Document configuration process and validation

### 7. Communication & Integration
- Implement consistent API response format
- Use session-based authentication for all connections
- Configure proper CORS and security for cross-domain requests
- Ensure Socket.io and PeerJS properly utilize sessions
- Plan for connection failures and reconnection strategies
- Document all communication protocols and interfaces
- Create a single domain deployment strategy with proper routing
- Implement proper Nginx configuration for WebSockets
- Test connection flows under various network conditions
- Maintain clear separation of concerns between different communication channels
- Document communication flows with sequence diagrams

### 8. Code Quality & Standards
- Follow consistent code style (Airbnb JavaScript guidelines)
- Implement automated code formatting (Prettier)
- Maintain high test coverage (minimum 70%)
- Conduct thorough code reviews for all changes
- Use clear, descriptive variable and function names
- Keep functions small and focused on single responsibilities
- Document public APIs and complex algorithms
- Implement pre-commit hooks for linting and formatting
- Follow semantic versioning for releases
- Maintain a detailed changelog
- Document code conventions and patterns

## Development Workflow

### Local Development on Fedora

1. **System Requirements**
   - Docker and Docker Compose
   - Git
   - Text editor or IDE of choice
   - Local HTTPS certificates (for WebRTC testing)

2. **Development Process**
   - Clone repository
   - Copy `.env.example` to `.env` and fill in local values
   - Use `docker-compose up --build` to start development environment
   - Make changes in either frontend or backend code
   - Commit changes frequently with meaningful messages
   - Push changes to appropriate feature branch

### Code Standards & Quality Assurance

1. **Linting & Formatting**
   - ESLint configuration: Airbnb style guide
   - Prettier configuration: 2-space indentation, single quotes, no semicolons
   - Husky pre-commit hooks for lint and format checks
   - Editor config file for consistent IDE settings

2. **Testing Standards**
   - Unit tests should cover all service methods
   - Integration tests for API endpoints
   - End-to-end tests for critical user flows
   - Test coverage requirement: minimum 70% (for hobby project)
   - Test naming convention: `describe('UnitName', () => { it('should perform expected behavior', () => {...}) })`

3. **Code Review Process**
   - All code changes must be submitted via pull request
   - At least one approval required before merging
   - All tests must pass in CI before merging
   - Linter and code style checks must pass
   - PR description should explain the purpose and implementation approach
   - PR template includes checklist for common issues

### Git Workflow

1. **Main Branches**
   - `main` (production-ready code)
   - `develop` (integration branch for features)

2. **Feature Branches**
   - Create from `develop`: `git checkout -b feature/new-feature`
   - Work on changes, commit frequently
   - Push to remote: `git push origin feature/new-feature`
   - Merge back to `develop` when complete via pull request

3. **Release Process**
   - Create release branch from `develop`: `git checkout -b release/v1.0.0`
   - Only bug fixes, documentation, and version updates in release branch
   - When ready, merge to `main` AND back to `develop`
   - Tag release on `main`: `git tag v1.0.0`
   - Document changes in release notes

4. **Hotfix Process**
   - For urgent production fixes, branch from `main`: `git checkout -b hotfix/critical-fix`
   - Fix the issue with minimal changes
   - Merge back to `main` AND `develop`
   - Tag the hotfix: `git tag v1.0.1`
   - Deploy immediately to production

### CI/CD Pipeline

1. **Continuous Integration (GitHub Actions)**
   - Triggered on all pull requests
   - Runs linting checks
   - Executes unit and integration tests
   - Builds Docker containers to verify build process
   - Reports test coverage
   - Validates documentation changes

2. **Continuous Deployment**
   - Manual deployment for hobby project (semi-automated)
   - Deployment script runs on merges to `main`
   - Creates Docker images with proper tags
   - Preserves database during deployments
   - Updates environment with zero-downtime if possible
   - Maintains deployment history log

### Logging & Monitoring

1. **Logging Standards**
   - Structured JSON logs using pino
   - Log levels: error, warn, info, debug, trace
   - Standard fields: timestamp, level, service, message, requestId
   - Context-specific fields added as needed
   - No sensitive data in logs (PII, credentials, etc.)

2. **Log Storage & Access**
   - Development: Console output and local file
   - Production: Log files with rotation
   - Optional: Aggregated logs in simple dashboard
   - Retention policy: 30 days

3. **Application Monitoring**
   - Basic health endpoint (`/health`)
   - Simple dashboard for game usage metrics
   - Error tracking for unhandled exceptions
   - Performance monitoring for critical endpoints

## Initial MVP Focus (First 6 Weeks)

To establish a solid foundation and get to a testable game quickly:

### Weeks 1-2: Foundation & Authentication
- Complete Stage 1 (Foundation Setup)
- Implement core database and authentication from Stage 2
- Focus on secure, working login/registration system
- Set up documentation structure and initial content

### Weeks 3-4: Game Core
- Build basic Svelte UI with navigation (Stage 3)
- Implement Phaser integration with one complete puzzle game
- Create minimal game UI and controls
- Document architecture and game mechanics

### Weeks 5-6: Minimal Multiplayer
- Implement basic Socket.io for matchmaking
- Add simple PeerJS connection for 1v1 play
- Test on target mobile devices
- Release MVP to daughter and friends for feedback
- Document multiplayer implementation

This approach delivers a playable single puzzle game with multiplayer capability within 6 weeks, establishing the core architecture while allowing for quick feedback from your initial users. From there, you can iterate and expand based on real-world usage and prioritized feedback.

## Conclusion

This development roadmap provides a structured approach to building your mobile browser puzzle game while emphasizing good practices in security, performance, and user experience. The MVP focus will help you get a functional game in your daughter's hands quickly, while the complete roadmap sets you up for expanding and polishing the game over time.

Special attention has been given to proper environment isolation and configuration management to ensure the development environment is properly sandboxed and separated from your host system. Using Docker containers with pinned dependency versions will create a consistent, reproducible environment regardless of what else is installed on your system.

The documentation strategy ensures that your codebase remains well-documented throughout development, with a clean, ocean-themed presentation that makes reference materials pleasant to use. The frontend-backend communication has been carefully designed to provide secure, reliable multiplayer gameplay with proper fallbacks for mobile network conditions.

The layered architecture approach with clear separation between routes, controllers, services, and models will make the codebase maintainable and testable. The well-defined Git workflow and CI/CD pipeline will ensure code quality and streamline development as the project grows.

Remember that as a hobby project, it's important to balance ambition with realistic time commitments and to celebrate small victories along the way. Good luck with your development journey!

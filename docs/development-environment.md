# Comprehensive Development Environment Documentation

## System Architecture Overview

The Ocean of Puzzles game uses a modern client-server architecture:

1. **Frontend**: 
   - Framework: Svelte with SvelteKit for UI components
   - Game Engine: Phaser 3 for game mechanics and rendering
   - Build Tool: Vite for development server and bundling
   - State Management: Svelte stores for reactive state

2. **Backend**:
   - Server: Node.js with Express.js framework
   - API: RESTful with JSON responses
   - Database: SQLite (file-based) for data persistence
   - Real-time: PeerJS server for peer-to-peer communications

3. **Container Infrastructure**:
   - Docker and Docker Compose for containerization
   - Bridge network for container communication
   - Volume mounts for code and database persistence

## Network & Port Configuration

### Default Port Assignments

| Service           | Default Port | Environment Variable | Container Port | Description                        |
|-------------------|--------------|----------------------|----------------|------------------------------------|
| Frontend (Vite)   | 3000         | FRONTEND_PORT        | 3000           | Svelte UI served by Vite          |
| Backend API       | 4000         | PORT                 | 4000           | Express REST API                   |
| PeerJS Server     | 9000         | PEERJS_PORT          | 9000           | WebRTC signaling server           |

### Port Conflict Issues

The development environment currently encounters port conflicts with existing services:

- **Port 3000**: Used by existing `open-webui` Docker container
- **Port 4000**: Available, but sometimes conflicts with other development services
- **Port 9000**: Available, but sometimes conflicts with other services

### Port Configuration Update

To resolve conflicts, we've updated the ports in the `.env` file:

```
PORT=4001                # Backend API port
FRONTEND_PORT=3001       # Frontend port
PEERJS_PORT=9001         # PeerJS server port
CORS_ORIGIN=http://localhost:3001  # Updated CORS setting
```

### Container Network Configuration

The Docker containers use a custom bridge network defined in `docker-compose.yml`:

```yaml
networks:
  puzzle-game-network:
    name: puzzle-game-network
    driver: bridge
```

This allows containers to communicate with each other using container names as hostnames.

## Server Configurations

### Frontend Server (Vite)

The frontend uses Vite's development server with the following configuration:

```javascript
// vite.config.js
server: {
  host: '0.0.0.0',  // Binds to all network interfaces
  port: parseInt(process.env.FRONTEND_PORT || '3001'),  // Uses env var or default
  proxy: {
    '/api': {
      target: `http://localhost:${process.env.PORT || 4001}`,
      changeOrigin: true
    },
    '/socket.io': {
      target: `http://localhost:${process.env.PORT || 4001}`,
      ws: true
    },
    '/peerjs': {
      target: `http://localhost:${process.env.PEERJS_PORT || 9001}`,
      ws: true
    }
  }
}
```

This configuration:
- Binds to all network interfaces (`0.0.0.0`) to allow access from Docker network
- Uses port from environment variable or default to 3001
- Sets up proxy routes for API, WebSocket, and PeerJS connections
- Enables CORS for proxied routes automatically

### Backend Server (Express)

The backend server is configured in `app.js` with several components:

```javascript
// Express configuration
const app = express();
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev_session_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.SECURE_COOKIES === 'true',
    maxAge: parseInt(process.env.SESSION_MAX_AGE || '604800000'),
    sameSite: 'lax'
  },
  store: new SQLiteStore({
    driver: sqlite3.Database,
    path: process.env.DB_PATH || './db/puzzle_game.sqlite',
    ttl: parseInt(process.env.SESSION_INACTIVE_TIMEOUT || '1800000'),
  })
}));

// API Routes
app.use('/api/v1', routes);

// PeerJS Server
const peerServer = PeerServer({
  port: parseInt(process.env.PEERJS_PORT || '9000'),
  path: process.env.PEERJS_PATH || '/peerjs'
});
```

### Database Configuration

The SQLite database is configured to initialize the schema if it doesn't exist:

```javascript
const dbPath = process.env.DB_PATH || './db/puzzle_game.sqlite';
const db = new sqlite3.Database(dbPath);

// Initialize database
initDatabase(db)
  .then(() => {
    logger.info('Database schema initialized successfully');
  })
  .catch(error => {
    logger.error('Failed to initialize database schema', { error });
    process.exit(1);
  });
```

## Container Configuration

### Docker Container Setup

The project uses Docker Compose with two main containers:

#### Backend Container

```yaml
backend:
  build:
    context: ./backend
    dockerfile: Dockerfile
  container_name: puzzle-game-backend
  ports:
    - "${PORT:-4000}:4000"
    - "${PEERJS_PORT:-9000}:9000"
  volumes:
    - ./backend:/app
    - /app/node_modules
    - ./backend/db:/app/db
  environment:
    - NODE_ENV=${NODE_ENV:-development}
    - PORT=${PORT:-4000}
    - PEERJS_PORT=${PEERJS_PORT:-9000}
    - DB_PATH=${DB_PATH:-./db/puzzle_game.sqlite}
    - SESSION_SECRET=${SESSION_SECRET:-dev_session_secret}
    - SESSION_MAX_AGE=${SESSION_MAX_AGE:-604800000}
    - SESSION_INACTIVE_TIMEOUT=${SESSION_INACTIVE_TIMEOUT:-1800000}
    - CORS_ORIGIN=${CORS_ORIGIN:-http://localhost:3000}
    - SECURE_COOKIES=${SECURE_COOKIES:-false}
    - PEERJS_KEY=${PEERJS_KEY:-peerjs}
    - PEERJS_PATH=${PEERJS_PATH:-/peerjs}
    - STUN_SERVER=${STUN_SERVER:-stun:stun.l.google.com:19302}
  restart: unless-stopped
  networks:
    - puzzle-game-network
```

#### Frontend Container

```yaml
frontend:
  build:
    context: ./frontend
    dockerfile: Dockerfile
  container_name: puzzle-game-frontend
  ports:
    - "${FRONTEND_PORT:-3000}:3000"
  volumes:
    - ./frontend:/app
    - /app/node_modules
  environment:
    - NODE_ENV=${NODE_ENV:-development}
    - FRONTEND_PORT=${FRONTEND_PORT:-3000}
    - VITE_API_URL=http://localhost:${PORT:-4000}/api/v1
    - VITE_SOCKET_URL=http://localhost:${PORT:-4000}
    - VITE_PEERJS_HOST=localhost
    - VITE_PEERJS_PORT=${PEERJS_PORT:-9000}
    - VITE_PEERJS_PATH=${PEERJS_PATH:-/peerjs}
  depends_on:
    - backend
  restart: unless-stopped
  networks:
    - puzzle-game-network
```

### Dockerfile Configuration

#### Backend Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies including those needed for SQLite
RUN apk add --no-cache python3 make g++ sqlite

COPY package.json ./
RUN npm install
COPY . .

# Create db directory if it doesn't exist
RUN mkdir -p db

CMD ["npm", "run", "dev"]
```

#### Frontend Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package.json ./
RUN npm install
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
```

## API Routes Structure

The backend API follows a RESTful structure:

```
/api/v1
├── /auth
│   ├── POST /login     - User authentication
│   ├── POST /register  - User registration
│   ├── GET /logout     - End user session
│   └── GET /me         - Get current user
├── /users
│   ├── GET /           - List users
│   ├── GET /:id        - Get user by ID
│   └── PUT /:id        - Update user
└── /games
    ├── GET /           - List games
    ├── POST /          - Create game
    ├── GET /:id        - Get game by ID
    ├── PUT /:id        - Update game
    ├── POST /:id/join  - Join game
    └── POST /:id/move  - Make move
```

## CORS Configuration

Cross-Origin Resource Sharing (CORS) is configured on the backend to allow requests from the frontend:

```javascript
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
```

This configuration:
- Restricts API access to the specified frontend origin
- Allows credentials (cookies, authorization headers) to be sent with requests
- Can be customized via the CORS_ORIGIN environment variable

## Authentication & Security

Authentication is implemented using:

- Express-session for session management
- Secure HTTP-only cookies for session tokens
- Salt and hash password storage using bcrypt
- Session timeouts and inactivity controls

## Local System Interfaces

The application interacts with the local system in several ways:

1. **File System**:
   - SQLite database file (`./db/puzzle_game.sqlite`)
   - Log files (`./logs/backend.log`, `./logs/frontend.log`)

2. **Network Interfaces**:
   - Binds to localhost (127.0.0.1) for direct local development
   - Binds to all interfaces (0.0.0.0) when running in Docker

3. **Environment Variables**:
   - Loads from `.env` file for configuration
   - Provides sensible defaults for all settings

## Recent Test Results

A recent test of the development environment encountered the following issue:

```
Error: listen EADDRINUSE: address already in use :::4001
    at Server.setupListenHandle [as _listen2] (node:net:1937:16)
    at listenInCluster (node:net:1994:12)
    at Server.listen (node:net:2099:7)
    at /home/ila/Projects/puzzle-game/backend/src/app.js:110:12
```

This indicates that:
1. Port 4001 is already in use by another process
2. The Express server cannot bind to this port
3. The PeerJS server also fails to start as a result

## Troubleshooting Guide

### Port Conflicts

To resolve port conflicts:

1. Identify what's using the port:
   ```bash
   ss -tuln | grep 4001
   ```

2. Either:
   - Stop the conflicting process, or
   - Change the port in `.env` to use a different port

3. Update the CORS settings if changing the frontend port:
   ```
   CORS_ORIGIN=http://localhost:<new-frontend-port>
   ```

### Docker Permission Issues

If you encounter Docker permission issues:

1. Add your user to the docker group:
   ```bash
   sudo usermod -aG docker $USER
   ```

2. Log out and back in for the group changes to take effect
3. Verify with: `docker ps`
4. If issues persist, restart the Docker service:
   ```bash
   sudo systemctl restart docker
   ```

### Process Management

To manage running processes:

1. List Node.js processes:
   ```bash
   ps aux | grep node
   ```

2. Kill a specific process:
   ```bash
   kill <PID>
   ```

3. Kill all Node.js processes:
   ```bash
   killall node
   ```

## Start-up Methods

The application can be started in several ways:

### 1. Development Script

```bash
./scripts/start-dev.sh
```
- Interactive menu with options for different types of startup
- Provides detailed logging and status information
- Handles environment setup automatically

### 2. Docker Compose

```bash
docker-compose up --build
```
- Starts both frontend and backend in Docker containers
- Uses port mappings from `.env` file or defaults
- Provides isolated environment with proper network configuration

### 3. Direct Local Development

```bash
# Start backend
cd backend
npm run dev

# In another terminal
cd frontend
npm run dev
```
- Runs directly on the host machine
- Useful for debugging specific components
- Requires port configuration to be set up manually

### 4. Custom Development Script

```bash
./run-dev.sh
```
- Starts both frontend and backend with correct port configuration
- Handles port conflict checking
- Manages process lifecycle and cleanup
- Saves logs to files for easier debugging

## Conclusion

The Ocean of Puzzles development environment is configured for flexibility, with multiple ways to run the application based on developer preferences. The containerized approach ensures consistent environments, while direct local development offers better debugging capabilities.

The main challenges revolve around port conflicts with existing services, which can be managed by:

1. Using environment variables to configure ports
2. Checking for port conflicts before starting services
3. Updating CORS settings when changing frontend ports

This comprehensive documentation should help you understand and manage the development environment effectively.
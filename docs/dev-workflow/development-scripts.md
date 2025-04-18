# Development Scripts

This document describes the development scripts available in the Ocean of Puzzles project.

## Quick Start

The simplest way to start development is:

```bash
# Using the command-line script
./dev.sh

# Or using npm
npm run dev

# Or using make
make dev
```

This will start both the frontend and backend in development mode.

## Features

The development scripts include the following features:

1. **Automatic port selection**: When run with `DYNAMIC_PORTS=1`, automatically finds available ports
2. **Docker detection**: Checks if Docker is running and detects rootless mode
3. **Prerequisite checking**: Verifies Node.js, npm, and Docker are installed
4. **Clean shutdown**: Properly shuts down all services on Ctrl+C
5. **Multiple entry points**: `./dev.sh`, `npm run dev`, or `make dev`
6. **Simplified commands**: Supports subcommands like `frontend`, `backend`, `compose`

## Command-Line Script (./dev.sh)

The `dev.sh` script is the primary development tool and supports several subcommands:

```bash
./dev.sh [command]
```

Available commands:

- `all`, `dev` (default): Start both frontend and backend
- `front`: Start frontend only
- `back`: Start backend only
- `compose`: Start using Docker Compose
- `clean`: Stop and remove Docker containers
- `check`: Check port availability

Environment variables:

- `DYNAMIC_PORTS=1`: Automatically find available ports
- `FORCE=1`: Proceed even if ports are in use
- `NODE_ENV=debug`: Enable verbose logging

Examples:
```bash
# Start with default ports
./dev.sh

# Start with dynamic port allocation
DYNAMIC_PORTS=1 ./dev.sh

# Start frontend only
./dev.sh front

# Start Docker environment
./dev.sh compose
```

## Make Commands

For convenience, a Makefile is provided with shortcut commands:

```bash
# Start full development environment
make dev

# Start frontend only
make front

# Start backend only
make back

# Start with Docker Compose
make compose

# Stop and clean up Docker containers
make clean

# Check port availability
make check

# Use dynamic port allocation
make ports

# Display help
make help
```

## NPM Scripts

The package.json includes npm scripts for development:

```bash
# Start development environment
npm run dev

# Start frontend only
npm run dev:frontend

# Start backend only
npm run dev:backend

# Start with Docker Compose
npm run dev:docker

# Start with dynamic port allocation
npm run dev:ports

# Run checks then start development
npm run dev:check
```

## Logs

All development logs are saved to the `logs/` directory:

- Frontend: `logs/frontend.log`
- Backend: `logs/backend.log`

## Port Configuration

The development environment uses the following default ports:

- Frontend: 3000
- Backend API: 4000
- PeerJS Server: 9000

If any of these ports are in use, you can:

1. Use dynamic port allocation: `DYNAMIC_PORTS=1 ./dev.sh`
2. Manually update the `.env` file with available ports
3. Run `npm run check` to check port availability

## Docker Development

For Docker-based development:

```bash
# Start with basic Docker Compose
./dev.sh compose

# Or with enhanced Traefik setup
docker-compose -f docker-compose.dev.yml up --build
```

## Troubleshooting

### Port Conflicts

If you see errors about ports being in use:

```bash
# Run with dynamic port allocation
DYNAMIC_PORTS=1 ./dev.sh

# Or check port availability
./dev.sh check
```

### Docker Issues

If you encounter Docker permission issues:

```bash
# Setup rootless Docker
dockerd-rootless-setuptool.sh install
systemctl --user enable --now docker
```

### Process Termination

If development processes don't shut down properly:

```bash
# Find and kill Node.js processes
pkill -f "node"
```

## Transitioning from Previous Scripts

The new development scripts replace the previous ocean-themed navigation system with a more efficient, robust approach that maintains the ocean theming while improving functionality.

Previous commands can be mapped to new ones:

| Old Command | New Command |
|-------------|-------------|
| `npm run start:dev` (Option 1) | `./dev.sh` or `npm run dev` |
| `npm run dev:logs` (Option 2) | `NODE_ENV=debug ./dev.sh` |
| `npm run dev:check` (Option 3) | `npm run dev:check` |
| Frontend only (Option 4) | `./dev.sh front` or `npm run dev:frontend` |
| Backend only (Option 5) | `./dev.sh back` or `npm run dev:backend` |
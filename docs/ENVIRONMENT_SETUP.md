# Ocean of Puzzles Environment Setup

This guide provides comprehensive instructions for setting up the Ocean of Puzzles development, testing, and production environments according to best practices for security and scalability.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Development Environment](#development-environment)
3. [Production Environment](#production-environment)
4. [Port Configuration](#port-configuration)
5. [Security Hardening](#security-hardening)
6. [Database Strategy](#database-strategy)
7. [Troubleshooting](#troubleshooting)

## Quick Start

For a quick setup of the development environment:

```bash
# Run the developer setup script
./scripts/dev-setup.sh

# This will:
# 1. Check for dependencies (Docker, docker-compose, npm)
# 2. Install npm dependencies if needed
# 3. Set up local domains in /etc/hosts
# 4. Generate self-signed certificates for HTTPS
# 5. Create a default .env file
# 6. Start the development environment with Traefik
```

## Development Environment

The development environment uses a combination of Docker containers and Traefik as a reverse proxy to provide a secure, consistent development experience.

### Features

- **Domain-based routing** instead of port-based access
- **HTTPS development** with self-signed certificates
- **Hot reloading** for both frontend and backend
- **Debugger support** with exposed debugging ports
- **Traefik dashboard** for visualizing routes

### Setup

1. **Configure local domains**

   Add the following entries to your `/etc/hosts` file:
   ```
   127.0.0.1 puzzles.local api.puzzles.local peerjs.puzzles.local traefik.puzzles.local
   ```
   
   Or use the automated script:
   ```bash
   sudo ./scripts/setup-local-domains.sh
   ```

2. **Set up HTTPS certificates** (optional but recommended)

   ```bash
   ./scripts/setup-local-certs.sh
   ```

3. **Start the development environment**

   ```bash
   docker-compose -f docker-compose.dev.yml up -d
   ```

4. **Access the application**

   - Frontend: http://puzzles.local or https://puzzles.local
   - Backend API: http://api.puzzles.local/api/v1
   - PeerJS: ws://peerjs.puzzles.local/peerjs
   - Traefik Dashboard: http://traefik.puzzles.local:8080

### Local Development Without Docker

For faster iteration or debugging specific components, you can run the services directly:

```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev
```

Use the port check script to ensure there are no conflicts:

```bash
./scripts/check-ports.js
```

## Production Environment

The production environment is configured for security, scalability, and zero-downtime deployments.

### Features

- **Least-privilege containers** with non-root users
- **Read-only filesystems** with temporary directories only where needed
- **Secure cookies** with proper sameSite settings
- **Named volumes** for database persistence
- **TLS everywhere** with automatic certificate management
- **Health checks** for all services

### Deployment

1. **Configure domain names**

   Update the domain names in `docker-compose.prod.yml` to match your actual domain.

2. **Set up environment variables**

   Create a `.env.prod` file with production values:
   ```bash
   cp .env .env.prod
   # Edit .env.prod with appropriate production values
   # Make sure SESSION_SECRET is a strong random value
   ```

3. **Deploy with Docker Compose**

   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

4. **Verify deployment**

   Check the health of all services:
   ```bash
   docker-compose -f docker-compose.prod.yml ps
   ```

## Port Configuration

The application uses the following default ports:

| Service           | Development            | Production             |
|-------------------|------------------------|------------------------|
| Frontend          | 3000 (puzzles.local)   | 3000 (internal only)   |
| Backend API       | 4000 (api.puzzles.local)| 4000 (internal only)   |
| PeerJS            | 9000 (peerjs.puzzles.local)| 9000 (internal only)   |
| Traefik HTTP      | 80                     | 80                     |
| Traefik HTTPS     | 443                    | 443                    |
| Traefik Dashboard | 8080                   | Disabled               |

If you encounter port conflicts, use the script to find available ports:

```bash
./scripts/check-ports.js
# Or to automatically fix port conflicts:
./scripts/port-config-fix.sh
```

## Security Hardening

The following security measures have been implemented:

1. **TLS everywhere** - All traffic is encrypted, even in development
2. **Secure cookies** - Session cookies are set with httpOnly, secure, and sameSite flags
3. **Non-root container users** - Containers run as non-root user
4. **Read-only filesystems** - Containers have read-only filesystems where possible
5. **Dropped capabilities** - Unnecessary Linux capabilities are dropped
6. **Private networks** - Internal services are not exposed directly to the host
7. **Least privilege** - Services only have the permissions they need

## Database Strategy

The current implementation uses SQLite for development and early testing, but the architecture is designed for a smooth transition to PostgreSQL for production:

### Transition Plan

1. **Development**: SQLite (file-based)
2. **Staging**: PostgreSQL container
3. **Production**: Managed PostgreSQL service

To enable this transition, the database access layer is abstracted behind an interface that supports both SQLite and PostgreSQL backends.

## Troubleshooting

### Docker Permission Issues

If you encounter permission issues with Docker:

```bash
# Setup rootless Docker
dockerd-rootless-setuptool.sh install
systemctl --user enable --now docker

# Or add your user to the docker group
sudo usermod -aG docker $USER
# Then log out and back in
```

### Port Conflicts

```bash
# Check for port conflicts
./scripts/check-ports.js

# Automatically fix port conflicts
./scripts/port-config-fix.sh
```

### Container Debugging

```bash
# View container logs
docker-compose logs -f [service_name]

# Shell into a container
docker exec -it [container_name] bash

# Check container health
docker inspect --format '{{.State.Health.Status}}' [container_name]
```
# Port Configuration and Development Environment

## Current Port Configuration Issue

The Ocean of Puzzles application is experiencing port conflicts in the local development environment. This document outlines the current state and recommended solutions.

## System Analysis

### Current Running Services

- **Port 3000**: Currently used by `open-webui` Docker container
- **Port 3080**: Used by LibreChat Docker container
- **Various other Docker services**: Running on other ports

### Application Requirements

The Ocean of Puzzles application requires the following ports:
- Frontend (Vite server): Default port 3000
- Backend API (Express): Default port 4000
- PeerJS server: Default port 9000

## Root Cause of 404 Issue

1. **Port Conflict**: The `open-webui` container is already using port 3000, which is the default frontend port
2. **Vite Port Resolution**: When Vite encounters a port conflict, it automatically tries the next available port (3001)
3. **CORS Configuration**: The backend is configured to accept requests from the frontend origin, which is expected to be on port 3000
4. **Configuration Synchronization**: Environment variables for ports need to be synchronized across frontend and backend

## Solution Implemented

We've modified the configuration to use different ports that don't conflict with existing services:

1. **Updated `.env` file**:
   ```
   PORT=4001                # Backend API port
   FRONTEND_PORT=3001       # Frontend port
   PEERJS_PORT=9001         # PeerJS server port
   CORS_ORIGIN=http://localhost:3001  # Updated CORS setting
   ```

2. **Updated `vite.config.js`**:
   ```javascript
   server: {
     host: '0.0.0.0',
     port: parseInt(process.env.FRONTEND_PORT || '3001'),
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

## Starting the Development Environment

### Option 1: Using the Development Script

```bash
cd /home/ila/Projects/puzzle-game
./scripts/start-dev.sh

# Choose option 1 for standard development or 2 for enhanced logging
```

### Option 2: Manual Startup

```bash
# Terminal 1 - Start Backend
cd /home/ila/Projects/puzzle-game/backend
npm run dev

# Terminal 2 - Start Frontend
cd /home/ila/Projects/puzzle-game/frontend
npm run dev
```

## Accessing the Application

- Frontend UI: http://localhost:3001/
- Backend API: http://localhost:4001/api/v1
- API Health Check: http://localhost:4001/health

## Troubleshooting

If you still encounter issues:

1. Check if the ports are actually in use: `ss -tuln | grep -E '3001|4001|9001'`
2. Verify Docker isn't using those ports: `docker ps`
3. Check that the environment variables are properly loaded
4. Look at the logs for any error messages: `./logs/backend.log` and `./logs/frontend.log`

## Docker Permission Issues

If you encounter Docker permission issues:

1. Add your user to the docker group: `sudo usermod -aG docker $USER`
2. Log out and back in for the group changes to take effect
3. Verify with: `docker ps`
4. If issues persist, you may need to restart the Docker service: `sudo systemctl restart docker`

## Port Conflict Management Strategy

For future reference, when facing port conflicts:

1. Identify all currently used ports: `ss -tuln`
2. Modify the `.env` file to use available ports
3. Ensure all configuration references to ports are updated
4. Restart the application with the new port settings
5. Update documentation to reflect the new port configuration

This approach provides a systematic way to handle port conflicts in local development environments.
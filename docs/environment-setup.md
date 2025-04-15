# Environment Setup

This guide explains how to set up your development and production environments for the Ocean of Puzzles project.

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v18 or v20 LTS recommended, v22+ may have compatibility issues with some dependencies)
- npm (v9 or later)
- Docker
- Docker Compose
- Git

> **Note about Node.js versions**: The project is designed to work with Node.js LTS versions (v18 or v20). Some dependencies (particularly `better-sqlite3`) may have compilation issues with newer Node.js versions like v22+. For the best experience, we recommend using Node.js v20 LTS.

## Development Environment

### Clone the Repository

```bash
git clone https://github.com/username/puzzle-game.git
cd puzzle-game
```

### Configure Environment Variables

1. Copy the example environment file:

```bash
cp .env.example .env
```

2. Open `.env` in your editor and fill in the required variables:

```
# Application Settings
NODE_ENV=development
PORT=4000
FRONTEND_PORT=3000
PEERJS_PORT=9000

# Database Configuration
DB_PATH=./backend/db/puzzle_game.sqlite

# Session Configuration
SESSION_SECRET=your_secure_random_string_here
SESSION_MAX_AGE=604800000  # 7 days in milliseconds
SESSION_INACTIVE_TIMEOUT=1800000  # 30 minutes in milliseconds

# Security Settings
CORS_ORIGIN=http://localhost:3000
SECURE_COOKIES=false

# PeerJS Configuration
PEERJS_KEY=peerjs
PEERJS_PATH=/peerjs
STUN_SERVER=stun:stun.l.google.com:19302
```

**Important:** Always use a strong, unique `SESSION_SECRET` in production environments.

### Start Development Environment

#### Ocean-Themed Interactive Development (Recommended)

Experience our soothing ocean-themed development environment:

```bash
# Start the ocean-themed interactive development navigator
npm run start:dev
```

This launches our colorful marine-themed menu with these options:
- 🌊 **Calm Waters** - Standard development (frontend + backend)
- 🔍 **Deep Dive** - Enhanced mode with detailed logging
- 🧪 **Treasure Hunter** - Run checks first, then start development
- 🏄‍♂️ **Surfing** - Frontend only (UI development)
- 🐠 **Coral Reef** - Backend only (API development)

Our development scripts will automatically:
- Create necessary logs directory with proper permissions
- Detect and install missing dependencies including nodemon (globally if needed)
- Provide clear, colorful feedback about the environment setup process
- Save detailed logs to the project's logs directory

#### Using Docker (Alternative)

```bash
docker-compose up --build
```

These development options will start:
- Backend API server at http://localhost:4000
- Frontend dev server at http://localhost:3000
- PeerJS server at http://localhost:9000

### Manual Setup (without Docker)

If you prefer to run the services without Docker:

1. Install backend dependencies:

```bash
cd backend
npm install
```

2. Install frontend dependencies:

```bash
cd frontend
npm install
```

3. Start the backend:

```bash
cd backend
npm run dev
```

4. In a separate terminal, start the frontend:

```bash
cd frontend
npm run dev
```

### Verify Setup

1. Open your browser and navigate to http://localhost:3000
2. You should see the Ocean of Puzzles home page
3. Visit http://localhost:4000/api/v1 to verify the API is working
4. You should see a JSON response with API information

## Production Environment

### Configure Production Environment Variables

1. Create a production environment file:

```bash
cp .env.example .env.production
```

2. Edit `.env.production` with production values:

```
NODE_ENV=production
PORT=4000
FRONTEND_PORT=3000
PEERJS_PORT=9000

DB_PATH=./backend/db/puzzle_game.sqlite

# Generate a strong random string for production
SESSION_SECRET=strong_random_string_here
SESSION_MAX_AGE=604800000
SESSION_INACTIVE_TIMEOUT=1800000

# Production domain
CORS_ORIGIN=https://game.example.com
SECURE_COOKIES=true

PEERJS_KEY=peerjs
PEERJS_PATH=/peerjs
STUN_SERVER=stun:stun.l.google.com:19302

# Optional TURN server for NAT traversal
# TURN_SERVER=turn:your-turn-server.com:3478
# TURN_USERNAME=your_username
# TURN_CREDENTIAL=your_password
```

### Build and Start Production Environment

```bash
# Use production configuration
docker-compose -f docker-compose.prod.yml up -d --build
```

### Nginx Configuration

1. Create Nginx configuration directories:

```bash
mkdir -p nginx/conf nginx/ssl nginx/www
```

2. Create a basic Nginx configuration file:

```bash
cat > nginx/conf/default.conf << 'EOF'
server {
    listen 80;
    server_name game.example.com;
    
    # Redirect HTTP to HTTPS
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name game.example.com;
    
    # SSL configuration
    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    
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
EOF
```

### SSL Certificates

For production, you'll need SSL certificates:

1. Using Let's Encrypt:

```bash
# Install certbot (on Ubuntu)
apt-get update
apt-get install certbot

# Generate certificates
certbot certonly --standalone -d game.example.com

# Copy certificates to Nginx SSL directory
cp /etc/letsencrypt/live/game.example.com/fullchain.pem nginx/ssl/
cp /etc/letsencrypt/live/game.example.com/privkey.pem nginx/ssl/
```

2. Set up auto-renewal:

```bash
# Create renewal script
cat > renew-ssl.sh << 'EOF'
#!/bin/bash
certbot renew
cp /etc/letsencrypt/live/game.example.com/fullchain.pem /path/to/puzzle-game/nginx/ssl/
cp /etc/letsencrypt/live/game.example.com/privkey.pem /path/to/puzzle-game/nginx/ssl/
docker-compose -f docker-compose.prod.yml exec nginx nginx -s reload
EOF
chmod +x renew-ssl.sh

# Add to crontab (runs twice a day)
(crontab -l 2>/dev/null; echo "0 0,12 * * * /path/to/renew-ssl.sh") | crontab -
```

## Database Backup Strategy

### Automated Backups

1. Create a backup script:

```bash
cat > backup-db.sh << 'EOF'
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR=/path/to/backups
DOCKER_COMPOSE_FILE=/path/to/puzzle-game/docker-compose.prod.yml

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Copy SQLite database file
docker-compose -f $DOCKER_COMPOSE_FILE exec -T backend cp /app/db/puzzle_game.sqlite /app/db/puzzle_game_backup.sqlite

# Export backup from container
docker-compose -f $DOCKER_COMPOSE_FILE cp backend:/app/db/puzzle_game_backup.sqlite $BACKUP_DIR/puzzle_game_$TIMESTAMP.sqlite

# Remove temporary backup file
docker-compose -f $DOCKER_COMPOSE_FILE exec -T backend rm /app/db/puzzle_game_backup.sqlite

# Keep only the 10 most recent backups
ls -tp $BACKUP_DIR/puzzle_game_*.sqlite | grep -v '/$' | tail -n +11 | xargs -I {} rm -- {}

echo "Backup completed: $BACKUP_DIR/puzzle_game_$TIMESTAMP.sqlite"
EOF
chmod +x backup-db.sh
```

2. Schedule daily backups:

```bash
(crontab -l 2>/dev/null; echo "0 2 * * * /path/to/backup-db.sh") | crontab -
```

## Troubleshooting

### Common Issues

1. **Docker Permission Issues**

```bash
# Add your user to the docker group
sudo usermod -aG docker $USER

# Log out and back in for the changes to take effect
```

2. **Port Conflicts**

If ports 3000, 4000, or 9000 are already in use, change them in the `.env` file and docker-compose files.

3. **Database Initialization Failure**

```bash
# Check permissions on database directory
sudo chown -R $USER:$USER backend/db

# Manually initialize database
cd backend
node -e "require('./src/db/init.js')()"
```

4. **Git Branch Issues**

If you encounter issues with branch management, our repository includes helpful tools:

```bash
# Sync your branches with remote
npm run branches:sync

# Clean up merged branches
npm run branches:clean-local

# Interactive branch cleanup with ocean-themed UI
npm run branches:cleanup
```

For more details, see the [Branch Management Guide](dev-workflow/branch-management.md).

5. **WebRTC Connection Issues**

If players cannot connect via WebRTC, ensure:
- STUN server is accessible
- Consider adding a TURN server for difficult NAT scenarios
- Check if Socket.io fallback is working

## Development Tips

- Use VSCode with ESLint and Prettier extensions for code formatting
- Run database migrations manually from the backend container
- For WebRTC debugging, Chrome DevTools Network tab has WebRTC-specific insights
- Test with multiple browsers and devices to ensure cross-platform compatibility
- Use Docker Compose's `--scale` option to test multiple clients during development

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Node.js Documentation](https://nodejs.org/en/docs/)
- [Svelte Documentation](https://svelte.dev/docs)
- [Phaser Documentation](https://newdocs.phaser.io/docs/3.55.2)
- [WebRTC Troubleshooting](https://webrtc.org/getting-started/troubleshooting)
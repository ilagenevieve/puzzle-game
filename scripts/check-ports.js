#!/usr/bin/env node

/**
 * Port availability checker
 * This script checks if the required ports are available before starting the application
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const net = require('net');

// ANSI color codes
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

// Load environment variables from .env file
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

// Define default ports if not set in .env
const FRONTEND_PORT = parseInt(process.env.FRONTEND_PORT || '3000', 10);
const BACKEND_PORT = parseInt(process.env.PORT || '4000', 10);
const PEERJS_PORT = parseInt(process.env.PEERJS_PORT || '9000', 10);

console.log(`${BLUE}===============================================${RESET}`);
console.log(`${BLUE}      Ocean of Puzzles - Port Checker       ${RESET}`);
console.log(`${BLUE}===============================================${RESET}`);
console.log();
console.log(`${BOLD}Checking if required ports are available...${RESET}`);
console.log();

/**
 * Check if a port is in use
 * @param {number} port - The port to check
 * @returns {Promise<boolean>} True if port is available, false if in use
 */
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(false); // Port is in use
      } else {
        // For other errors, assume port is available
        resolve(true);
      }
    });
    
    server.once('listening', () => {
      // Close the server and return true (port is available)
      server.close(() => {
        resolve(true);
      });
    });
    
    server.listen(port);
  });
}

/**
 * Find an available port starting from the given port
 * @param {number} startPort - The port to start checking from
 * @returns {Promise<number>} The first available port
 */
async function findAvailablePort(startPort) {
  let port = startPort;
  
  // Try up to 100 ports
  for (let i = 0; i < 100; i++) {
    if (await isPortAvailable(port)) {
      return port;
    }
    port++;
  }
  
  // If we couldn't find an available port, return -1
  return -1;
}

/**
 * Find what process is using a port
 * @param {number} port - The port to check
 * @returns {string} Information about the process using the port
 */
function getProcessUsingPort(port) {
  try {
    // Use lsof on Unix systems
    const output = execSync(`lsof -i :${port} -t`).toString().trim();
    if (output) {
      const pid = output.split('\n')[0];
      const processInfo = execSync(`ps -p ${pid} -o comm=`).toString().trim();
      return { pid, name: processInfo };
    }
  } catch (error) {
    // Command failed or returned no results
  }
  
  return { pid: null, name: 'Unknown' };
}

async function main() {
  let frontendOk = true;
  let backendOk = true;
  let peerjsOk = true;
  
  // Check frontend port
  const frontendAvailable = await isPortAvailable(FRONTEND_PORT);
  if (frontendAvailable) {
    console.log(`${GREEN}✓ Port ${FRONTEND_PORT} (Frontend) is available${RESET}`);
  } else {
    console.log(`${RED}✘ Port ${FRONTEND_PORT} (Frontend) is already in use!${RESET}`);
    const { pid, name } = getProcessUsingPort(FRONTEND_PORT);
    if (pid) {
      console.log(`  Process using this port: ${name}`);
      console.log(`  Process ID: ${pid}`);
    }
    console.log(`  ${YELLOW}Consider changing the port in your .env file${RESET}`);
    frontendOk = false;
  }
  
  // Check backend port
  const backendAvailable = await isPortAvailable(BACKEND_PORT);
  if (backendAvailable) {
    console.log(`${GREEN}✓ Port ${BACKEND_PORT} (Backend API) is available${RESET}`);
  } else {
    console.log(`${RED}✘ Port ${BACKEND_PORT} (Backend API) is already in use!${RESET}`);
    const { pid, name } = getProcessUsingPort(BACKEND_PORT);
    if (pid) {
      console.log(`  Process using this port: ${name}`);
      console.log(`  Process ID: ${pid}`);
    }
    console.log(`  ${YELLOW}Consider changing the port in your .env file${RESET}`);
    backendOk = false;
  }
  
  // Check PeerJS port
  const peerjsAvailable = await isPortAvailable(PEERJS_PORT);
  if (peerjsAvailable) {
    console.log(`${GREEN}✓ Port ${PEERJS_PORT} (PeerJS Server) is available${RESET}`);
  } else {
    console.log(`${RED}✘ Port ${PEERJS_PORT} (PeerJS Server) is already in use!${RESET}`);
    const { pid, name } = getProcessUsingPort(PEERJS_PORT);
    if (pid) {
      console.log(`  Process using this port: ${name}`);
      console.log(`  Process ID: ${pid}`);
    }
    console.log(`  ${YELLOW}Consider changing the port in your .env file${RESET}`);
    peerjsOk = false;
  }
  
  console.log();
  
  // Summary and suggestions
  if (frontendOk && backendOk && peerjsOk) {
    console.log(`${GREEN}✓ All ports are available!${RESET}`);
    console.log(`${GREEN}✓ You can safely start the application.${RESET}`);
    console.log();
    console.log(`  Frontend: http://localhost:${FRONTEND_PORT}`);
    console.log(`  Backend API: http://localhost:${BACKEND_PORT}/api/v1`);
    console.log(`  PeerJS: ws://localhost:${PEERJS_PORT}`);
    console.log();
    process.exit(0); // Success
  } else {
    console.log(`${RED}✘ Some ports are already in use.${RESET}`);
    console.log(`${YELLOW}Finding available ports...${RESET}`);
    
    // Find available ports
    const availableFrontendPort = !frontendOk ? await findAvailablePort(FRONTEND_PORT) : FRONTEND_PORT;
    const availableBackendPort = !backendOk ? await findAvailablePort(BACKEND_PORT) : BACKEND_PORT;
    const availablePeerjsPort = !peerjsOk ? await findAvailablePort(PEERJS_PORT) : PEERJS_PORT;
    
    console.log();
    console.log(`${BOLD}Recommended port configuration:${RESET}`);
    console.log(`  Frontend: ${GREEN}${availableFrontendPort}${RESET}${availableFrontendPort !== FRONTEND_PORT ? ` (changed from ${FRONTEND_PORT})` : ''}`);
    console.log(`  Backend:  ${GREEN}${availableBackendPort}${RESET}${availableBackendPort !== BACKEND_PORT ? ` (changed from ${BACKEND_PORT})` : ''}`);
    console.log(`  PeerJS:   ${GREEN}${availablePeerjsPort}${RESET}${availablePeerjsPort !== PEERJS_PORT ? ` (changed from ${PEERJS_PORT})` : ''}`);
    console.log();
    
    console.log(`${YELLOW}Recommendation:${RESET}`);
    console.log(`  1. Edit your ${BOLD}.env${RESET} file and change the port configuration:`);
    
    if (!frontendOk) {
      console.log(`     - Change ${BOLD}FRONTEND_PORT=${FRONTEND_PORT}${RESET} to ${BOLD}FRONTEND_PORT=${availableFrontendPort}${RESET}`);
    }
    
    if (!backendOk) {
      console.log(`     - Change ${BOLD}PORT=${BACKEND_PORT}${RESET} to ${BOLD}PORT=${availableBackendPort}${RESET}`);
    }
    
    if (!peerjsOk) {
      console.log(`     - Change ${BOLD}PEERJS_PORT=${PEERJS_PORT}${RESET} to ${BOLD}PEERJS_PORT=${availablePeerjsPort}${RESET}`);
    }
    
    console.log(`  2. Also update ${BOLD}CORS_ORIGIN=${process.env.CORS_ORIGIN || `http://localhost:${FRONTEND_PORT}`}${RESET} to match your new frontend port`);
    console.log(`  3. Run the port-config-fix.sh script to automatically update your configuration`);
    console.log();
    
    console.log(`${BLUE}===============================================${RESET}`);
    
    process.exit(1); // Error: ports are in use
  }
}

main().catch(err => {
  console.error(`${RED}Error checking ports:${RESET}`, err);
  process.exit(1);
});
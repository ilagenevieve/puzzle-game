FROM node:18-alpine

WORKDIR /app

# Add dependencies for better-sqlite3
RUN apk add --no-cache python3 make g++ sqlite

# Copy package files first for better caching
COPY package.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Create db directory if it doesn't exist
RUN mkdir -p db

# Set environment variables
ENV NODE_ENV=development
ENV PORT=4000
ENV PEERJS_PORT=9000

# Expose ports
EXPOSE ${PORT}
EXPOSE ${PEERJS_PORT}

# Start command
CMD ["npm", "run", "dev"]
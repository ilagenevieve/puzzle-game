FROM node:18-alpine

WORKDIR /app

# Copy package files first for better caching
COPY package.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Set environment variables
ENV NODE_ENV=development
ENV FRONTEND_PORT=3000

# Expose port
EXPOSE ${FRONTEND_PORT}

# Start command
CMD ["npm", "run", "dev"]
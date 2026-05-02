# Build stage
FROM node:20-slim AS builder
WORKDIR /app

# Install frontend dependencies and build
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install
COPY frontend/ ./frontend/
RUN cd frontend && npm run build

# Production stage
FROM node:20-slim
WORKDIR /app

# Install backend dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm install --production

# Copy built frontend
COPY --from=builder /app/frontend/dist ./frontend/dist

# Copy backend source
COPY backend/ ./backend/

# Set environment
ENV NODE_ENV=production
ENV PORT=8080

# Expose port
EXPOSE 8080

# Start server
CMD ["node", "backend/index.js"]

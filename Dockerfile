# Build stage
FROM node:20-slim AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code and build the application
COPY . .
RUN npm run build

# Production stage (using Nginx to serve the static files)
FROM nginx:alpine

# Copy the build output to the Nginx html directory
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 (Cloud Run will automatically route to this)
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]

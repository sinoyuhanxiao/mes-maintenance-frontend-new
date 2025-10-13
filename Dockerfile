# Stage 1: Construction
# Base Image: Alpine variant with the official Node.js LTS version
FROM node:20-alpine AS builder

# 1. Define the construction parameter BUILD_MODE
ARG BUILD_MODE=staging

# Construction Command
ENV BUILD_COMMAND="npm run build:${BUILD_MODE}"

# Set the Working Directory
WORKDIR /app

# 2. Copy the environment file
COPY package.json package-lock.json ./

# Install Dependencies
RUN npm install --registry=https://registry.npmmirror.com

# Copy the environment file and the project code
COPY .env* .

# Copy all project files
COPY nginx.conf ./
COPY . .

# Run the build command
RUN ${BUILD_COMMAND}


# Stage 2: Operation
# Base Image: Using the official Alpine variant of Nginx
FROM nginx:alpine

# Remove the default configuration file of Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Solving the issue of 404 error occurring when directly accessing child routes in the Vue Router history mode
COPY --from=builder /app/nginx.conf /etc/nginx/conf.d/default.conf

# Copy the compiled static files from the build stage to the default hosting directory of Nginx
# Directory: /app/dist -> /usr/share/nginx/html
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port. Nginx defaults to listening on port 80.
EXPOSE 80

# Start the Nginx service
CMD ["nginx", "-g", "daemon off;"]

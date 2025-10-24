# Stage 1: Construction
FROM node:20-alpine AS builder

# 1. Define the construction parameter BUILD_MODE
ARG BUILD_MODE=staging

# Construction Command
ENV BUILD_COMMAND="npm run build:${BUILD_MODE}"

# Set the Working Directory
WORKDIR /app

# 2. Copy dependency files ONLY to enable caching of npm install
COPY package.json package-lock.json ./

# Install Dependencies (Cached if package.json does not change)
RUN npm install --registry=https://registry.npmmirror.com

# 3. Copy all remaining files (project code, .env files, nginx.conf)
# This step's cache will only break if code/config changes, NOT dependency list.
COPY .env* .
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

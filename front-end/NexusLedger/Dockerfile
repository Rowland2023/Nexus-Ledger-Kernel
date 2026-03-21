# --- Stage 1: Build with Node ---
FROM node:22-bullseye AS build
WORKDIR /app

# Copy package manifests
COPY package*.json ./
COPY .npmrc* ./

# Install dependencies
RUN npm install --force

# Copy source code
COPY . .

# Build optimized static assets
RUN npm run build

# --- Stage 2: Serve with Nginx ---
FROM nginx:1.25-alpine
WORKDIR /usr/share/nginx/html

# Remove default Nginx static files
RUN rm -rf ./*

# Copy built assets from Stage 1
COPY --from=build /app/dist ./

# ✅ ACTIVE: Copy your custom Nginx config to handle the /api proxy
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
FROM node:22-alpine

# Set environment variable to bypass the OpenSSL 3.0 "illegal parameter" alert
# This allows the handshake to complete on restrictive networks
ENV NODE_TLS_REJECT_UNAUTHORIZED=0

WORKDIR /app

# Copy the source files
COPY node-shared-kernel/shared-kernel ./node-shared-kernel/shared-kernel
COPY node-shared-kernel/my-node-project ./node-shared-kernel/my-node-project

WORKDIR /app/node-shared-kernel/my-node-project

# 1. Clear cache to ensure no corrupted metadata exists
# 2. Use the official mirror but with reduced SSL strictness
RUN npm config set strict-ssl false && \
    npm cache clean --force && \
    npm install --loglevel notice

# 4. Expose and Start
EXPOSE 3000
CMD ["npm", "run", "dev"]
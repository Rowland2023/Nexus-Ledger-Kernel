FROM node:22-alpine

WORKDIR /app

# 1. Copy both folders
COPY node-shared-kernel/shared-kernel ./node-shared-kernel/shared-kernel
COPY node-shared-kernel/my-node-project ./node-shared-kernel/my-node-project

# 2. Install dependencies in the project folder
# 2. Install dependencies normally (relying on --network=host)
WORKDIR /app/node-shared-kernel/my-node-project
RUN npm install

# 🚀 THE CRITICAL ADDITION: Create the symlink during the build
RUN ln -s /app/node-shared-kernel/my-node-project/node_modules /app/node-shared-kernel/shared-kernel/node_modules

# 3. Start
EXPOSE 3000
CMD ["node", "index.js"]
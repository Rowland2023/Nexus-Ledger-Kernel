FROM node:22-bullseye

WORKDIR /app

# 1. Copy only manifests first
COPY node-shared-kernel/package*.json ./

# 2. Install dependencies (This is usually where it hangs if the network is slow)
RUN npm install --force

# 3. Copy the source code
COPY node-shared-kernel/ .

# 4. If you have a build step (TypeScript/NestJS), add it here
# RUN npm run build 

EXPOSE 3000

CMD ["npm", "run", "dev"]
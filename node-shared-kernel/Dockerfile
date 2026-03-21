# node-shared-kernel/Dockerfile
FROM node:22-alpine
WORKDIR /app
COPY node-shared-kernel/package*.json ./
COPY node-shared-kernel/my-node-project/package*.json ./my-node-project/
COPY node-shared-kernel/shared-kernel/package*.json ./shared-kernel/
RUN npm install
COPY node-shared-kernel/ ./
EXPOSE 3000
CMD ["npm", "run", "start", "--workspace=my-node-project"]
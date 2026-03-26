FROM node:22-bullseye

WORKDIR /app

# 1. Copy only the frontend dependency files
COPY package*.json ./

# 2. Install dependencies
RUN npm install --force

# 3. Copy the rest of the FRONTEND code
COPY . .

# 4. Start the Vite dev server
CMD ["npm", "run", "dev"]
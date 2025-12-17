FROM node:20-alpine

WORKDIR /app

COPY package.json .
COPY apps/api/package.json ./apps/api/

# Install dependencies for the workspace
RUN npm install

COPY apps/api ./apps/api

WORKDIR /app/apps/api

EXPOSE 3000

CMD ["npm", "run", "dev"]

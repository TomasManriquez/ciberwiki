FROM node:20-alpine

WORKDIR /app

COPY package.json .
COPY apps/web/package.json ./apps/web/

# Install dependencies for the workspace
RUN npm install

COPY apps/web ./apps/web

WORKDIR /app/apps/web

EXPOSE 4321

CMD ["npm", "run", "dev", "--", "--host"]

# SIMRS Esa Unggul: one image with the web app and the API.
# The API serves the built web app and talks to PostgreSQL (DATABASE_URL).

FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Demo deployments may show the preset demo accounts on the login screen.
ARG VITE_DEMO_MODE=false
RUN VITE_API_URL=/api VITE_DEMO_MODE=$VITE_DEMO_MODE npm run build && npm run server:build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=8080 STATIC_DIR=dist DB_DIR=db
# The server is bundled into server/dist, so no node_modules are needed at runtime.
COPY --from=build /app/dist ./dist
COPY --from=build /app/server/dist ./server/dist
COPY db ./db
USER node
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s CMD wget -qO- http://127.0.0.1:8080/api/health || exit 1
CMD ["node", "server/dist/index.js"]

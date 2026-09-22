# ---------- build stage ----------
FROM node:20-alpine AS builder

# `VITE_*` est injecté À LA COMPILATION : il doit donc être disponible comme
# variable d'environnement du stage de build, pas seulement comme ARG.
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---------- production stage ----------
FROM nginx:1.27-alpine AS production

# Configuration nginx : SPA (fallback index.html) + proxy /api vers le backend.
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY security-headers.conf /etc/nginx/security-headers.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost/ >/dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]

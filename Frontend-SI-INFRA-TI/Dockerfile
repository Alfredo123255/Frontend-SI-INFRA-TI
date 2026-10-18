# syntax=docker/dockerfile:1
FROM node:24-alpine AS build
WORKDIR /build
COPY package.json package-lock.json ./
# react-simple-maps declara peers hasta React 18; reproducir el árbol existente con React 19.
RUN npm ci --legacy-peer-deps
COPY index.html vite.config.js ./
COPY src ./src
COPY public ./public
# API del mismo origen: el navegador usa /api y Nginx la dirige al backend.
ENV VITE_API_URL=""
RUN npm run build

FROM nginx:stable-alpine
COPY --from=build /build/dist /usr/share/nginx/html
COPY docker/default.conf.template /etc/nginx/templates/default.conf.template
ENV BACKEND_UPSTREAM=backend:8080 NGINX_ENVSUBST_FILTER=BACKEND_UPSTREAM
EXPOSE 5173
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -q -O /dev/null http://127.0.0.1:5173/healthz || exit 1

# ---------- build ----------
FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Build args (se inyectan desde GitHub Actions o docker build --build-arg)
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_API_URL
ARG VITE_USE_SUPABASE_AUTH

# Vite solo expone variables con prefijo VITE_
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_USE_SUPABASE_AUTH=$VITE_USE_SUPABASE_AUTH

RUN npm run build

# ---------- serve ----------
FROM caddy:2-alpine

# Copy the built application
COPY --from=build /app/dist /srv

# Copy Caddy configuration
COPY Caddyfile /etc/caddy/Caddyfile

EXPOSE 80

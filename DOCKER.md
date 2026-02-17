# Inmo24x7 Backoffice - Docker Deployment with Caddy

## Quick Start

### Build with environment variables:

```bash
# Opción 1: Con build-args
docker build \
  --build-arg VITE_SUPABASE_URL=https://your-project.supabase.co \
  --build-arg VITE_SUPABASE_ANON_KEY=your-anon-key \
  --build-arg VITE_API_URL=http://localhost:3000 \
  --build-arg VITE_USE_SUPABASE_AUTH=false \
  -t inmo24x7-backoffice .

# Opción 2: Usando un archivo .env
docker build --build-arg $(cat .env | xargs) -t inmo24x7-backoffice .
```

### Run the container:
```bash
docker run -p 80:80 inmo24x7-backoffice
```

The application will be available at `http://localhost`

## Docker Compose

### Simple (solo frontend):
```bash
docker-compose up -d
```

### Con Caddy como reverse proxy completo:
```bash
docker-compose -f docker-compose.caddy.yml up -d
```

## Environment Variables

Vite embebe las variables en tiempo de build. Debes pasarlas como `ARG` al construir:

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | URL de Supabase | `https://abc123.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Anon key de Supabase | `eyJhbGciOiJIUzI1NiIs...` |
| `VITE_API_URL` | URL del backend API | `http://localhost:3000` |
| `VITE_USE_SUPABASE_AUTH` | Habilitar auth | `false` |

## Production Deployment

### GitHub Actions example:

```yaml
name: Build and Deploy

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Docker image
        run: |
          docker build \
            --build-arg VITE_SUPABASE_URL=${{ secrets.VITE_SUPABASE_URL }} \
            --build-arg VITE_SUPABASE_ANON_KEY=${{ secrets.VITE_SUPABASE_ANON_KEY }} \
            --build-arg VITE_API_URL=${{ secrets.VITE_API_URL }} \
            --build-arg VITE_USE_SUPABASE_AUTH=true \
            -t ghcr.io/${{ github.repository }}:latest .
      
      - name: Push to registry
        run: docker push ghcr.io/${{ github.repository }}:latest
```

## Caddy Features

- ✅ **Automatic HTTPS** (solo necesitas un dominio)
- ✅ **HTTP/2 & HTTP/3** support
- ✅ **Compression** (gzip, zstd)
- ✅ **Client-side routing** support (React Router)
- ✅ **Security headers**
- ✅ **Static asset caching**

## Troubleshooting

### View logs:
```bash
docker logs <container-id>
```

### Shell into container:
```bash
docker exec -it <container-id> /bin/sh
```

### Rebuild with no cache:
```bash
docker build --no-cache -t inmo24x7-backoffice .
```

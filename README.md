# NEXUS — Agile Project Management Platform

> Auto-deployment: every push to `main` deploys the frontend to Vercel production automatically via the native Vercel–GitHub integration (connected to `dev640/nexus`). No extra setup or secrets required.

## How auto-deploy works

The Vercel project **frontend** is connected to this GitHub repository (`dev640/nexus`, branch `main`). Vercel builds the project from the repo root using [`vercel.json`](vercel.json):

- Build: `cd frontend && npm install && npm run build` (Vite)
- Output: `frontend/dist`
- SPA rewrite so client-side routes fall back to `index.html`

Every push to `main` triggers a production deployment automatically. Nothing else needs to be configured.

### Live URL

- Production: **https://frontend-one-umber-31.vercel.app**

### Local development

| Service | Command | URL |
|---|---|---|
| Frontend (Vite) | `cd frontend && npm run dev` | http://localhost:5173 |
| Backend (Spring Boot) | run the pre-built JAR or `docker compose up backend` | http://localhost:8080 |
| Database (Postgres) | `docker compose up -d postgres` | localhost:5432 |
| Cache (Redis) | `docker compose up -d redis` | localhost:6379 |

> The backend is currently a pre-built JAR image started by Docker Compose. To build the backend from source locally, use the Spring Boot runner in `backend/`.

## Project structure

```
frontend/   React + TypeScript + Tailwind, Vite, React Router
backend/    Spring Boot (JVM) — pre-built JAR in Docker
.docker/    Docker Compose for Postgres + Redis + backend
```

## Credentials

| Environment | Credential | Notes |
|---|---|---|
| Vercel (deploy) | native GitHub integration — no token needed | Connected via Vercel dashboard → project → Settings → Git. |
| Admin login (mock) | email: `dev` / password: `Shdev_admin` | Frontend mock only — not wired to a real backend auth endpoint yet. |
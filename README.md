# Nexus — Agile Project Management Platform

> Auto-deployment: every push to `main` deploys the frontend to Vercel production automatically via the native Vercel–GitHub integration (connected to `dev640/nexus`). No extra setup or secrets required.

## How auto-deploy works

The Vercel project **frontend** is connected to this GitHub repository (`dev640/nexus`, branch `main`). Vercel builds the project from the repo root using [`vercel.json`](vercel.json):

- Build: `cd frontend && npm install && npm run build` (Vite)
- Output: `frontend/dist`
- SPA rewrite so client-side routes fall back to `index.html`

Every push to `main` triggers a production deployment automatically. Nothing else needs to be configured.

### Live URL

- Production: **https://frontend-one-umber-31.vercel.app**

## Local development

| Service | Command | URL |
|---|---|---|
| Frontend (Vite) | `cd frontend && npm run dev` | http://localhost:5173 |
| Backend (Spring Boot) | `cd backend && ./mvnw spring-boot:run` | http://localhost:8080 |
| Database (Postgres) | `docker compose up -d postgres` | localhost:5432 |
| Cache (Redis) | `docker compose up -d redis` | localhost:6379 |

## Tests

Frontend (typecheck + lint):

```
cd frontend
npm run check     # tsc -b --noEmit
npm run lint      # oxlint
```

Backend (JUnit; uses an in-memory H2 in PostgreSQL mode so no Docker/Postgres is needed):

```
cd backend
./mvnw test       # full suite
```

## Status

P0 infra scaffold: landing + login, core CRUD endpoints for Project/Sprint/Task, and the authenticated workspace shell.

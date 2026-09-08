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

## External API proxy layer

The free public APIs surfaced in the API Vault (catalog curated from [Apivault.dev](https://apivault.dev)) are proxied through the backend so browser CORS never blocks a call and upstream rate limits are managed in one place:

```
GET /api/external                              list proxied APIs
GET /api/external/quotes/random                ZenQuotes inspiration
GET /api/external/weather/London?format=j1     wttr.in weather (JSON)
GET /api/external/bored/activity               Bored API activity
GET /api/external/exchange/latest/USD          exchange rates
GET /api/external/jsonplaceholder/todos/1      mock task data
GET /api/external/reddit/productivity/hot.json subreddit feed
```

The frontend (`src/lib/proxy.ts`) probes `/api/health` and uses the proxy when the backend is up; otherwise it transparently falls back to direct browser fetches (or demo data where upstreams block CORS, e.g. Reddit).

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
./mvnw test                              # full suite
./mvnw test -Dtest='ExternalApi*Test'    # targeted: proxy service + controller
```

Covered: upstream URL building/encoding per proxied API, unknown-slug 404, upstream-failure 502 translation, and controller slug/path delegation.

## Status

P0 infra scaffold plus the API Vault experience: landing + login, core CRUD endpoints for Project/Sprint/Task, the Apivault-curated free API catalog, playground and integrations pages, and the backend proxy layer.

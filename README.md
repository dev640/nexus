# NEXUS — Agile Project Management Platform

Full-stack scaffold: React/TypeScript/Tailwind frontend, Spring Boot 4 (Java 21) backend, PostgreSQL + Redis.

## Prerequisites

- Node.js 20+ (installed: v22)
- JDK 21 (installed via winget: Eclipse Temurin 21.0.12)
- Docker (for Postgres/Redis) — not installed on this machine yet

## Frontend

```
cd frontend
npm install
npm run dev        # http://localhost:5173
```

## Backend

```
cd backend
./mvnw spring-boot:run   # http://localhost:8080
```

Requires Postgres + Redis running (see `docker-compose.yml` at repo root):

```
docker compose up -d
```

Without Docker, point `spring.datasource.url` / `spring.data.redis.host` in
`backend/src/main/resources/application.properties` at any reachable
Postgres 16 / Redis 7 instance.

## Structure

```
frontend/   React + TS + Tailwind v4, React Router, TanStack Query, Zustand
backend/    Spring Boot 4, Spring Data JPA, Spring Security, WebSocket, Redis
docker-compose.yml   Postgres + Redis for local dev
```

### Backend packages

```
domain/         JPA entities (user, organization, workspace, project, sprint, task)
repository/     Spring Data repositories
web/            REST controllers (/api/projects, /api/sprints, /api/tasks, /api/health,
                /api/external — proxy over the Apivault-curated free APIs)
config/         SecurityConfig (CORS + permitAll placeholder — JWT auth not yet wired)
```

## External API proxy layer

The free public APIs surfaced in the API Vault (catalog curated from
[Apivault.dev](https://apivault.dev)) are proxied through the backend so browser
CORS never blocks a call and upstream rate limits are managed in one place:

```
GET /api/external                              list proxied APIs
GET /api/external/quotes/random                ZenQuotes inspiration
GET /api/external/weather/London?format=j1     wttr.in weather (JSON)
GET /api/external/bored/activity               Bored API activity
GET /api/external/exchange/latest/USD          exchange rates
GET /api/external/jsonplaceholder/todos/1      mock task data
GET /api/external/reddit/productivity/hot.json subreddit feed
```

The frontend (`src/lib/proxy.ts`) probes `/api/health` and uses the proxy when
the backend is up; otherwise it transparently falls back to direct browser
fetches (or demo data where upstreams block CORS, e.g. Reddit).

### Frontend structure

```
src/components/layout/   Sidebar, AppShell
src/components/ui/       shared components
src/pages/               one file per primary nav route
src/lib/nav.ts           sidebar navigation config + API Vault categories
src/lib/proxy.ts         backend proxy client with direct-fetch fallback
src/hooks/queries.ts     TanStack Query hooks over the proxy (quote, weather, bored, rates, reddit)
```

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

Covered: upstream URL building/encoding per proxied API, unknown-slug 404,
upstream-failure 502 translation, and controller slug/path delegation.

## Status

P0 infra scaffold plus the API Vault experience: routes, core CRUD endpoints
for Project/Sprint/Task, the Apivault-curated free API catalog, playground and
integrations pages, and the backend proxy layer. Auth, AI features, board/
backlog UI, wiki, whiteboard, chat and the marketing site are not built yet —
see the product spec for full scope and MVP priority order (P0 → P3).

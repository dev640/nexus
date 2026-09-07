# NEXUS — Agile Project Management Platform

> Auto-deployment: every push to `main` deploys the frontend to Vercel production automatically via GitHub Actions.

## One-time Vercel auto-deploy setup

The repository includes [.github/workflows/vercel-auto-deploy.yml](.github/workflows/vercel-auto-deploy.yml), which runs `npx vercel deploy --prod --yes` on every push to `main`. To activate it, add one GitHub Actions secret to this repository:

1. Go to **GitHub → dev640/nexus → Settings → Secrets and variables → Actions → Secrets → New repository secret**.
2. Create a secret named **`VERCEL_TOKEN`** with the value:
   ```
   <your-vercel-token>
   ```
3. After saving, the next push to `main` triggers the workflow and Vercel deploys automatically.

### already-live Vercel URL

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
.github/    GitHub Actions (Vercel auto-deploy workflow)
```

## Credentials

| Environment | Credential | Notes |
|---|---|---|
| Vercel (deploy token) | *store as GitHub Actions secret `VERCEL_TOKEN`* | Never commit to the repo. Get it from Vercel → Settings → Tokens. |
| Admin login (mock) | email: `dev` / password: `Shdev_admin` | Frontend mock only — not wired to a real backend auth endpoint yet. |

> The Vercel token is intentionally **not** committed to the repository. The workflow reads it from the `VERCEL_TOKEN` GitHub Actions secret.

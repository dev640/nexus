# Nexus — Product Requirements Document

> One intelligent workspace for planning, building, documenting and shipping software.
> This PRD describes the product, what is built today, and what remains. It doubles as the
> reference for the multi-phase completion plan.

**Status:** Phases 0–5 complete · Phases 6–8 in progress
**Last updated:** 2026-09-23

---

## 1. Problem & Vision

Small product teams juggle 3–5 disconnected tools: a tracker for tasks, a doc tool for specs,
a canvas for architecture, a spreadsheet for capacity. Context is lost between them and the plan
drifts from the work.

**Vision:** a single fast workspace where backlog, sprints, docs, whiteboards and an AI copilot
share one data model, so the plan and the work never diverge.

**Positioning:** free while in beta, no seat limits, no credit card.

---

## 2. Users & Roles

| Role | Capabilities |
|------|-------------|
| `ADMIN` | Everything, plus changing other users' roles |
| `MEMBER` | Create/edit projects, tasks, sprints, wiki, whiteboard |
| `DEVELOPER` | Same as MEMBER (reserved for future permission tuning) |
| `VIEWER` | Read-only (enforced at API level in a later phase) |

Authentication is email + password with JWT bearer tokens (24h access token). Anyone can
self-register; new accounts join as `MEMBER`.

---

## 3. Feature Requirements

### 3.1 Authentication — ✅ Built
- **FR-A1** Register with name, email, password (min 8 chars).
- **FR-A2** Log in and receive access + refresh tokens.
- **FR-A3** Session survives a page reload (token persisted, workspace re-fetched).
- **FR-A4** All `/api/*` routes except auth and health require a valid token.
- **FR-A5** Log out clears the token and the in-memory workspace.

### 3.2 Projects — ✅ Built
- **FR-P1** List projects with status, health, progress, current sprint number, member count.
- **FR-P2** Create a project (defaults to `PLANNING` / `ON_TRACK`).
- **FR-P3** Project detail surfaces the team and quick "add task".

### 3.3 Sprints — ✅ Built
- **FR-S1** Create a sprint with goal, start/end dates, committed points.
- **FR-S2** Sprint numbers auto-increment per project.
- **FR-S3** End date must be after start date (validated server-side).
- **FR-S4** Change sprint status: `PLANNED` → `ACTIVE` → `COMPLETED`.

### 3.4 Tasks, Board & Backlog — ✅ Built
- **FR-T1** Create tasks with title, project, optional sprint, status, priority, points, assignee.
- **FR-T2** Board groups tasks by status across six lanes.
- **FR-T3** Changing status on the board updates the API optimistically with rollback on failure.
- **FR-T4** Backlog shows tasks with no sprint.
- **FR-T5** Labels are stored per task.
- **FR-T6** Assigning a task notifies the assignee.

### 3.5 Users, Roles & Settings — ✅ Built
- **FR-U1** Roster of all workspace users, available as assignees.
- **FR-U2** Update your own display name; persists to the server.
- **FR-U3** `ADMIN` can change any user's role from Settings; others see a read-only badge.
- **FR-U4** Unauthorized role changes are rejected with 403.

### 3.6 Wiki — ✅ Built
- **FR-W1** Create, edit and delete markdown pages.
- **FR-W2** Pages can be linked to a project or left general.
- **FR-W3** Author is recorded from the authenticated user.
- **FR-W4** Search across page titles and content (`?q=`).

### 3.7 Inbox & Calendar — ✅ Built
- **FR-I1** Notifications are generated on task assignment (never for self-assignment).
- **FR-I2** Unread count, mark-one-read, mark-all-read, archive.
- **FR-I3** Inbox filters by category and honours muted categories.
- **FR-I4** Calendar renders sprint windows and today's marker on a real month grid.

### 3.8 Analytics — ✅ Built
- **FR-AN1** Velocity per sprint: committed vs completed points.
- **FR-AN2** Breakdowns by status and priority.
- **FR-AN3** Team load: open tasks and open points per person.
- **FR-AN4** Risk detection from real task state (stale reviews, unstarted urgent work,
      work stuck in testing).
- **FR-AN5** Summary tiles: total tasks, completion rate, open risks.

### 3.9 AI Copilot — ✅ Built (stage 1: grounded)
- **FR-C1** Answers questions about blockers, urgent work, sprint progress and workload.
- **FR-C2** Every answer is computed from live task/sprint/user data — deterministic, offline,
      no external AI service and no API key.
- **FR-C3** Side panels show detected risks, sprint progress and team capacity.
- **FR-C4** *(Stage 2, Phase 7)* optional LLM provider behind the same interface, with automatic
      fallback to grounded mode when no API key is configured.

### 3.10 Whiteboard — 🔜 Phase 6
- **FR-WB1** Sticky notes with colour, text, position; add/edit/move/delete.
- **FR-WB2** Boards persist to the server rather than the browser.
- **FR-WB3** Live sync across sessions over WebSocket (STOMP), with Redis pub/sub so multiple
      backend instances stay consistent.

### 3.11 My Work & Help — ✅ Built
- **FR-M1** "My Work" lists the signed-in user's tasks and their inbox summary.
- **FR-H1** Help page documents the workspace.

---

## 4. Non-Functional Requirements

- **NFR-1 Performance** — API responses well under 200ms for seeded data volumes; frontend
  bundle ~118 kB gzipped.
- **NFR-2 Security** — Passwords hashed with BCrypt; JWT HS256 with a ≥256-bit secret supplied by
  environment variable; DB credentials from environment in production; secrets never committed
  (`.env*` gitignored).
- **NFR-3 Data integrity** — Flyway migrations own the schema (`ddl-auto=validate`); migrations are
  append-only, never edited after being applied.
- **NFR-4 Reliability** — Task runs end to end against a clean database with `docker compose up`.
- **NFR-5 Quality gates** — CI runs frontend lint + build and the backend unit test suite on every
  push/PR to `main`.
- **NFR-6 Portability** — Backend is a plain Docker image; frontend builds to static assets.

---

## 5. Architecture

```
frontend/   React 19 · TypeScript · Vite 8 · Tailwind 4 · React Router 7 · Zustand · axios
api/        (removed — frontend calls the backend directly via VITE_API_URL)
backend/    Spring Boot 4.1 (Java 21) · Spring Security 7 · Spring Data JPA · Flyway ·
            PostgreSQL 16 · Redis 7
docker-compose.yml   postgres + redis + backend
```

**Request flow:** React app → axios client (JWT bearer injected from localStorage) → Spring Boot
REST controllers → services → repositories → PostgreSQL. Flyway manages schema; Hibernate
validates against it on boot.

**Frontend state:** a single Zustand store mirrors server state. Reads come from
`loadWorkspace()`; writes call the API and update the store from the response (optimistic for
status changes, with rollback on failure).

### 5.1 API surface (implemented)

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/auth/register` | Create account, returns tokens |
| POST | `/api/auth/login` | Authenticate, returns tokens |
| GET | `/api/health` | Liveness (public) |
| GET | `/api/users` | List workspace users |
| PATCH | `/api/users/me` | Update own display name |
| PATCH | `/api/users/{id}/role` | Change role (**ADMIN**) |
| GET | `/api/projects` · POST | List · create projects |
| GET/PATCH/DELETE | `/api/projects/{id}` | Read · update · delete |
| GET | `/api/sprints` (`?projectId`) | List sprints |
| POST | `/api/sprints` | Create sprint |
| PATCH | `/api/sprints/{id}/status` | Change sprint status |
| GET | `/api/tasks` (`?projectId`,`?sprintId`) | List tasks |
| POST | `/api/tasks` | Create task |
| PATCH | `/api/tasks/{id}/status` | Move task across the board |
| GET | `/api/wiki` (`?q`) | List/search wiki pages |
| POST | `/api/wiki` | Create page |
| PATCH/DELETE | `/api/wiki/{id}` | Update · delete page |
| GET | `/api/notifications` | My notifications |
| GET | `/api/notifications/unread-count` | Unread badge count |
| PATCH | `/api/notifications/{id}/read` | Mark one read |
| POST | `/api/notifications/read-all` | Mark all read |
| DELETE | `/api/notifications/{id}` | Archive |
| GET | `/api/analytics/overview` (`?projectId`) | Velocity, breakdowns, load, risks |

### 5.2 Data model

`users` · `projects` · `sprints` · `tasks` · `task_labels` · `wiki_pages` · `notifications`
(all `BIGSERIAL` primary keys, timestamps on every table).

Migrations: `V1` schema · `V2` seed data · `V3` task labels join table · `V4` seed password repair
· `V5` wiki pages · `V6` notifications.

---

## 6. Delivery Plan

| Phase | Scope | Status |
|-------|-------|--------|
| 0 | CI, Docker test stage, backend unit tests | ✅ Done |
| 1 | Frontend ↔ backend integration (auth, projects, sprints, board, backlog) | ✅ Done |
| 2 | Users, roles, settings | ✅ Done |
| 3 | Wiki | ✅ Done |
| 4 | Inbox notifications + calendar | ✅ Done |
| 5 | Analytics + grounded AI Copilot | ✅ Done |
| 6 | Whiteboard with real-time sync | 🔜 Next |
| 7 | Optional LLM-backed Copilot (falls back to grounded mode) | 🔜 |
| 8 | Production deployment (Railway/Render + Vercel), hardening | 🔜 |

### Phase 8 scope
- Deploy the backend Docker image to Railway/Render with managed Postgres + Redis.
- Environment-provided `NEXUS_JWT_SECRET` (≥32 bytes), DB/Redis URLs.
- CORS restricted to the deployed frontend origin.
- Vercel env `VITE_API_URL` pointing at the backend.
- Refresh-token endpoint, auth rate limiting, actuator lockdown.

---

## 7. Local Development

```bash
# 1. Backend stack (Postgres + Redis + Spring Boot)
docker compose up -d --build

# 2. Frontend dev server (proxies /api to localhost:8080)
cd frontend && npm install && npm run dev   # http://localhost:5173

# 3. Seed logins (password: password123)
#    devendra@nexus.com (ADMIN) · achal@nexus.com · vidhi@nexus.com · palak@nexus.com

# 4. Tests
docker build --target test ./backend      # backend unit + compile
cd frontend && npm run lint && npm run build
```

---

## 8. Success Metrics

- A new engineer can register, create a project, sprint and task, and see them on the board in
  under five minutes.
- Every page in the navigation renders live data — no mock-only views.
- CI is green on `main`; the stack starts from a clean checkout with one command.

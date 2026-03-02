# CLAUDE.md — Zoho Desk Viewer

This file provides context for AI assistants (Claude, Copilot, etc.) working on this codebase.

---

## Project Overview

**Zoho Desk Viewer** is a local, read-only desktop web app for browsing Zoho Desk data exported as CSV files. It requires no Zoho API credentials — users export their data once, seed a local SQLite database, and browse everything through a browser UI.

Key constraints:
- **Read-only** by design: the SQLite database is opened with `{ readonly: true }` after seeding.
- **No external services**: all data stays on the user's machine.
- **XSS protection**: HTML email thread content is sanitized via DOMPurify and rendered in fully sandboxed iframes (`sandbox=""`).

---

## Repository Structure

```
zoho-desk-viewer/
├── packages/
│   ├── client/          # React 19 SPA (Vite, MUI, TanStack Query, React Router v7)
│   │   └── src/
│   │       ├── api/
│   │       │   ├── client.ts        # Typed fetch wrappers for every API endpoint
│   │       │   └── hooks.ts         # TanStack Query hooks (useTickets, useThreads, …)
│   │       ├── components/
│   │       │   ├── accounts/        # AccountListView, AccountDetailView
│   │       │   ├── common/          # DataTable, HtmlContent (sandboxed iframe), PriorityChip, StatusChip
│   │       │   ├── contacts/        # ContactListView, ContactDetailView
│   │       │   ├── dashboard/       # DashboardView (stat cards + Recharts)
│   │       │   ├── layout/          # AppShell (flex wrapper), Sidebar (nav + department picker)
│   │       │   └── tickets/         # TicketListView, TicketDetailView, ThreadList, CommentList, TicketListFilters, TicketMetadataSidebar
│   │       ├── context/
│   │       │   └── DepartmentContext.tsx  # Global department filter (React context)
│   │       ├── App.tsx              # Route definitions
│   │       ├── main.tsx             # App entrypoint (QueryClientProvider, ThemeProvider, BrowserRouter)
│   │       └── theme.ts             # MUI theme (colors, typography, component overrides)
│   ├── server/          # Express 4 REST API backed by better-sqlite3
│   │   └── src/
│   │       ├── db/
│   │       │   ├── connection.ts    # Singleton DB handle (readonly)
│   │       │   ├── seed.ts          # One-time CSV → SQLite importer
│   │       │   └── queries/         # One file per entity: tickets, threads, comments, contacts, accounts, agents, departments, dashboard
│   │       ├── routes/              # One Express router per entity (mirrors queries/)
│   │       └── index.ts             # Server bootstrap (port 3001, CORS for :5173)
│   └── shared/          # Shared TypeScript types only
│       └── src/types/index.ts       # All domain interfaces: Ticket, Thread, Comment, Contact, Account, Agent, Department, TimeEntry, PaginatedResponse, TicketFilters, DashboardStats
├── sample-data/         # Safe mock CSVs (committed)
├── csv-data/            # Real Zoho exports (gitignored)
├── data/                # SQLite database file (gitignored)
├── docs/                # Screenshots for README
├── package.json         # Root workspace + scripts
└── tsconfig.base.json   # Shared TS compiler options
```

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend framework | React | 19 |
| UI components | Material UI (MUI) | 6/7 |
| Charts | Recharts | 2 |
| Routing | React Router | 7 |
| Data fetching | TanStack Query | 5 |
| HTML sanitization | DOMPurify | 3 |
| Build tool | Vite | 6 |
| Backend framework | Express | 4 |
| Database | better-sqlite3 (SQLite) | 11 |
| CSV parsing | PapaParse | 5 |
| TypeScript runner | tsx | 4 |
| Language | TypeScript | 5.7 |
| Package manager | npm workspaces | — |

---

## Development Workflows

### Initial Setup

```bash
npm install
CSV_DIR=sample-data npm run seed   # seed database with sample data
npm run dev                        # start both server and client
```

- Client: http://localhost:5173
- Server: http://localhost:3001
- API health check: http://localhost:3001/api/health

### Npm Workspace Scripts (root `package.json`)

| Script | What it does |
|--------|-------------|
| `npm run seed` | Run `packages/server/src/db/seed.ts` via `tsx` |
| `npm run dev` | Run server + client concurrently (blue/green labels) |
| `npm run dev:server` | Express server only with `tsx watch` |
| `npm run dev:client` | Vite dev server only |
| `npm run build` | `tsc` + `vite build` across all workspaces |

### Re-seeding

The seeder **exits early if `data/zoho.db` already exists**. Delete it first:

```bash
rm -f data/zoho.db
CSV_DIR=sample-data npm run seed
```

### Using Real Zoho Data

Place Zoho CSV exports in `csv-data/` (gitignored), then:

```bash
CSV_DIR=csv-data npm run seed
npm run dev
```

---

## Architecture Decisions

### Monorepo with npm Workspaces

Three packages: `@zohodesk/client`, `@zohodesk/server`, `@zohodesk/shared`. The `shared` package is referenced via the workspace protocol (`"*"`) and points directly at its TypeScript source — there is **no build step** for `shared`; both client and server import its `.ts` files directly.

### Vite Proxy

All `/api/*` requests from the Vite dev server (`:5173`) are proxied to Express (`:3001`). In production builds, a reverse proxy or serving the client from Express would be needed.

### Database Access Pattern

- **Seed** (`seed.ts`): opens DB in read-write mode, creates tables, imports CSVs, creates indexes, then closes.
- **Runtime** (`connection.ts`): singleton opened in `readonly: true` mode with WAL and foreign keys enabled.
- **Queries** (`db/queries/*.ts`): each file exports plain functions that call `getDb()` and use `better-sqlite3`'s synchronous API (`.prepare().get()`, `.prepare().all()`).
- **Routes** (`routes/*.ts`): thin Express routers that parse query params and call the query functions directly — no async/await needed since better-sqlite3 is synchronous.

### CSV Import Format

Zoho Desk exports have a non-standard header layout:
- Row 0: human-readable column names (ignored)
- Row 1: API field names (ignored — position-based mapping is used instead)
- Row 2+: data rows

The seeder uses `COLUMN_MAPS` (position-based arrays in `seed.ts`) to map CSV columns to DB columns, skipping columns prefixed with `_`. Boolean fields are explicitly converted via `toBool()`, integer fields via `toInt()`.

### Filtering and Sorting

Ticket filtering is SQL-level with parameterized queries. The allowed sort columns are whitelisted (`allowedSorts` array in `db/queries/tickets.ts`) to prevent SQL injection via sort field. Search is a `LIKE '%term%'` on `subject` only.

### Department Filter

A React context (`DepartmentContext`) holds the currently selected department ID. Components that need it (Sidebar picker, TicketListView, DashboardView) consume `useDepartment()`. The selected department is passed as a query parameter to relevant API calls.

### HtmlContent Component

Email thread content (`threads.content`) can contain HTML. `HtmlContent` sanitizes it with DOMPurify (allowlist of safe tags/attributes) then renders it inside a fully sandboxed `<iframe sandbox="">`. The iframe auto-sizes to its content height.

---

## Database Schema

Tables and their primary keys:

| Table | Primary Key | Notes |
|-------|------------|-------|
| `departments` | `id TEXT` | |
| `agents` | `id TEXT` | |
| `accounts` | `id TEXT` | |
| `contacts` | `id TEXT` | `accountId` FK |
| `tickets` | `id TEXT` | `departmentId`, `contactId`, `assigneeId`, `accountId` FKs |
| `threads` | `id TEXT` | `ticketId` FK |
| `comments` | `id TEXT` | `entityId` = ticketId |
| `timeEntries` | `id TEXT` | `requestId` = ticketId |

Indexes on all common filter/join columns (see `seed.ts` `INDICES` array).

---

## API Endpoints

All endpoints are prefixed with `/api`.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/tickets` | Paginated ticket list with filters |
| GET | `/api/tickets/:id` | Single ticket with joined names |
| GET | `/api/tickets/:id/threads` | Paginated threads for a ticket |
| GET | `/api/tickets/:id/comments` | All comments for a ticket |
| GET | `/api/contacts` | Paginated contact list with optional search |
| GET | `/api/contacts/:id` | Single contact |
| GET | `/api/contacts/:id/tickets` | Tickets for a contact |
| GET | `/api/accounts` | Paginated account list with optional search |
| GET | `/api/accounts/:id` | Single account with its contacts |
| GET | `/api/accounts/:id/tickets` | Tickets for an account |
| GET | `/api/agents` | All agents |
| GET | `/api/departments` | All departments |
| GET | `/api/dashboard` | Aggregate stats (optional `?departmentId=`) |

### Ticket Query Parameters

`status`, `priority`, `assigneeId`, `channel`, `departmentId`, `search`, `sortBy`, `sortOrder` (`asc`|`desc`), `page`, `pageSize` (max 100).

---

## Shared Types

All domain types live in `packages/shared/src/types/index.ts`. Always import from `@zohodesk/shared`:

```ts
import type { Ticket, TicketFilters, PaginatedResponse } from '@zohodesk/shared';
```

Key types: `Ticket`, `Thread`, `Comment`, `Contact`, `Account`, `Agent`, `Department`, `TimeEntry`, `PaginatedResponse<T>`, `TicketFilters`, `DashboardStats`.

---

## Code Conventions

### TypeScript

- Strict mode enabled globally (`"strict": true` in `tsconfig.base.json`).
- Target: ES2022, module resolution: `bundler`.
- All packages extend `tsconfig.base.json`.
- Prefer `import type` for type-only imports.

### React / Client

- Function components only (no class components).
- Named exports for all components (`export function Foo`), default export only for `App`.
- Custom hooks live in `src/api/hooks.ts`; all are thin wrappers around `useQuery`.
- MUI `sx` prop for inline styles; the global theme is in `src/theme.ts`.
- No testing framework is currently set up.

### Server / Queries

- No async/await — better-sqlite3 is synchronous throughout.
- Routes are thin: parse params → call query function → `res.json()`.
- Query functions live in `db/queries/`, one file per domain entity.
- SQL sort fields are always validated against an explicit allowlist before interpolation.

### Naming

- Files: `camelCase.ts` / `PascalCase.tsx` for components.
- React components: `PascalCase`.
- Hooks: `use` prefix.
- DB query functions: verb + entity (`getTickets`, `getTicketById`, `getDashboardStats`).
- Route files: lowercase entity name (`tickets.ts`, `contacts.ts`).

---

## Git Branches

| Branch | Purpose |
|--------|---------|
| `main` | Stable, production-ready code |
| `dev` | Active development base — PRs should target this branch |
| `claude/*` | AI-assisted feature branches |

**Development workflow**: branch from `dev`, open a PR back to `dev`, merge `dev` → `main` for releases.

---

## Gitignored Paths

```
node_modules/    # dependencies
dist/            # build output
data/*.db        # SQLite database (user data)
data/*.db-shm    # SQLite WAL shared memory
data/*.db-wal    # SQLite WAL file
csv-data/        # real Zoho exports (user data)
*.log
.DS_Store
```

Never commit real customer data. The `sample-data/` directory contains safe mock data and is committed.

---

## Security Notes

- The SQLite database is opened **read-only** at runtime — no mutation endpoints exist.
- HTML thread content is sanitized with DOMPurify before rendering and displayed in a `<iframe sandbox="">` with **no capabilities** (no scripts, no forms, no popups).
- CORS is restricted to `http://localhost:5173` only.
- SQL injection is prevented via parameterized queries (`?` placeholders) throughout, plus sort-field allowlisting.
- No credentials, tokens, or API keys are stored anywhere in the codebase.

---

## Common Tasks for AI Assistants

### Adding a new API endpoint

1. Add a query function in `packages/server/src/db/queries/<entity>.ts`.
2. Add a route handler in `packages/server/src/routes/<entity>.ts`.
3. Mount the router in `packages/server/src/index.ts`.
4. Add a typed `api.<method>()` call in `packages/client/src/api/client.ts`.
5. Add a `use<Entity>()` hook in `packages/client/src/api/hooks.ts`.

### Adding a new shared type

Edit `packages/shared/src/types/index.ts`. Both client and server pick it up immediately (no build step needed for shared).

### Adding a new page / route

1. Create the component in the appropriate `packages/client/src/components/<section>/` directory.
2. Import and add a `<Route>` in `packages/client/src/App.tsx`.
3. Add a nav item in `packages/client/src/components/layout/Sidebar.tsx`.

### Modifying the database schema

1. Update the `SCHEMAS` record in `packages/server/src/db/seed.ts`.
2. Update the `COLUMN_MAPS` record to reflect CSV column positions.
3. Update the relevant `BOOLEAN_FIELDS` / `INTEGER_FIELDS` sets if needed.
4. Update the corresponding query in `packages/server/src/db/queries/`.
5. Delete `data/zoho.db` and re-run `npm run seed`.

### Running only one part of the stack

```bash
npm run dev:server   # Express only (port 3001)
npm run dev:client   # Vite only (port 5173) — API calls will fail without the server
```

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project context & collaboration style

This is a **learning project** — the user is building this ecommerce app to practice fullstack development. The code here is a teaching artifact, not just a deliverable. The user often writes in Thai; respond in Thai when they do, English when they do.

**Before writing or editing any code, you MUST:**

1. **Explain first, then code.** State what you're about to do and *why* in plain language — never jump straight to tool calls. This rule applies even to one-line changes.
2. **Walk through new code line by line.** After writing, explain each meaningful line: what it does, why it's there, and what would break without it. Skip only truly trivial lines (`import`, closing braces).
3. **Teach the *why* behind best practices.** When you pick an idiomatic approach — parameterized SQL (vs string concatenation), `SELECT ... FOR UPDATE` in transactions, bcrypt salt rounds, JWT in `Authorization: Bearer`, TanStack Query `staleTime`, `'use client'` directives, etc. — explain *why* it's the standard, what the wrong alternative would do, and when to deviate.
4. **Pitch at beginner-to-intermediate.** Assume the user has built small projects but not a production fullstack app. Define jargon on first use (e.g. "middleware = a function that runs between the request arriving and your route handler").
5. **Show common pitfalls.** Where a beginner would naturally write something insecure, slow, or buggy (storing plaintext passwords, forgetting `await`, missing FK indexes, leaking JWTs to localStorage without thinking, mutating React state), call it out alongside the correct version.

If the user asks for something that violates a best practice, do it but flag the trade-off — don't silently "fix" their request, and don't refuse.

## Design system

Design tokens, color palette, typography, and component patterns live in **`Theme.md`** at the repo root. **Read it before touching any UI** in `client/`. The palette is intentionally narrow (semantic tokens `bg-surface`, `bg-surface-card`, `bg-surface-deep`, `text-ink`, `text-ink-muted`, `text-ink-faint`); do not introduce new accent colors without updating `Theme.md` first.

## Commands

Run from the repo root unless noted; npm workspaces dispatches into `client/` and `server/`.

- `npm install` — installs both workspaces.
- `npm run dev` — starts API (port 4000) and web client (port 3000) concurrently.
- `npm run dev:server` / `npm run dev:client` — start one side only.
- `npm run db:init` — runs `sql/init.sql` against the configured database. **Destructive: drops `users`, `products`, `orders`, `order_items` first.**
- `npm run build --workspace=client` / `npm run start --workspace=client` — Next.js prod build & serve.
- `npm run lint --workspace=client` — Next.js lint.

The server uses `node --watch` for dev; there is no test runner configured.

## Architecture

### Monorepo layout

npm workspaces (`client`, `server`). The root `package.json` only orchestrates dev scripts via `concurrently`. Each workspace owns its own deps.

### Server (`server/`) — Express MVC over raw SQL

Request flow: `routes/*` → `controllers/*` → `models/*` → `config/db.js` (pg `Pool`).

- **No ORM.** Models import `{ query, getClient }` from `src/config/db.js` and run parameterized SQL directly. `query()` runs single statements; `getClient()` checks out a client for transactions.
- **Transactional order creation** lives in `models/orderModel.js#createWithItems`. It opens a transaction, runs `SELECT ... FOR UPDATE` on the affected products to lock them against concurrent checkouts, validates stock, inserts the order + items, decrements stock, and commits. Stock/missing-product errors are thrown with `err.status = 400` so `errorHandler` returns 400 instead of 500.
- **Auth.** `middleware/authMiddleware.js` exposes `requireAuth` (verifies `Authorization: Bearer <jwt>`, sets `req.user = { id, role }`) and `requireRole(...roles)` (RBAC gate). Tokens are signed in `userController` with `JWT_SECRET` / `JWT_EXPIRES_IN`. `bcryptjs` hashes passwords with `BCRYPT_SALT_ROUNDS`.
- **Route guards by resource:**
  - `productRoutes` — public reads, admin-only writes (`requireRole('admin')`).
  - `orderRoutes` — entire router is behind `requireAuth`; controllers scope queries to `req.user.id` so users only see their own orders.
  - `userRoutes` — `register`/`login` public, `me` requires auth, `list` is admin-only.
- **DB config.** `config/db.js` prefers `DATABASE_URL`, falls back to discrete `PGHOST`/`PGPORT`/`PGUSER`/`PGPASSWORD`/`PGDATABASE`. The `init-db.js` script reads `sql/init.sql` and pipes it through `pool.query` as a single multi-statement string.

### Client (`client/`) — Next.js 15 App Router

- **Provider tree.** `app/layout.js` renders `app/providers.js` (a client component) which instantiates a per-render `QueryClient` via `lib/queryClient.js#createQueryClient` and wraps children in `QueryClientProvider`. Creating the client inside `useState` is intentional — it avoids sharing a client across SSR requests.
- **API client.** `lib/api.js` exports `api.{get,post,put,delete}`, each backed by a `fetch` wrapper that prefixes `NEXT_PUBLIC_API_URL`, JSON-encodes bodies, attaches `Authorization: Bearer` when a token is passed, and throws `Error(message.error)` on non-2xx so TanStack Query surfaces the message in `error`.
- **Path alias.** `jsconfig.json` maps `@/*` to the workspace root, so imports use `@/lib/api`, `@/components/ProductCard`, etc.
- **Tailwind** is v3 with PostCSS; `content` globs cover `app/**` and `components/**` only — new top-level dirs need to be added to `tailwind.config.js`.

### Schema (`sql/init.sql`)

Single re-runnable file. Tables: `users`, `products`, `orders`, `order_items` with FK cascades (`orders.user_id`, `order_items.order_id`) and a RESTRICT on `order_items.product_id` to block deleting products that have been ordered. `pg` returns `NUMERIC` columns as **strings** — cast with `Number(...)` before doing math (see `ProductCard`, `orderModel`).

## Gotchas

- Re-running `npm run db:init` wipes all data — there is no migration history, only this one file.
- Order creation can fail mid-transaction with `Insufficient stock` / `Product not found`; the rollback is automatic but the controller re-throws, so any new error paths need to preserve `err.status` to avoid leaking 500s.
- The `users` route `findByEmail` returns the full row including `password_hash`; only the auth flow should call it. Other reads must use `findById`, which projects safe columns.

# Ecommerce Mini Project

Monorepo for a small ecommerce app.

- `client/` — Next.js 15 (App Router), Tailwind CSS, TanStack Query v5
- `server/` — Express.js + PostgreSQL (raw SQL via `pg`), JWT auth
- `sql/init.sql` — schema for `users`, `products`, `orders`, `order_items`

## Prerequisites

- Node.js 20+
- Docker Desktop (for running PostgreSQL via `docker-compose.yml`) — alternative: any PostgreSQL 14+ instance

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Start PostgreSQL (Docker)

```bash
docker compose up -d           # start postgres in background
docker compose ps              # confirm "healthy"
docker compose logs -f postgres  # tail logs (Ctrl+C to exit)
```

The container exposes Postgres on `localhost:5432` with credentials `postgres / postgres` and database `ecommerce` (matches `server/.env.example`). Data persists in the named volume `pg-runstore-data`.

Lifecycle:
- `docker compose down` — stop containers (data preserved)
- `docker compose down -v` — stop and **delete the volume** (full reset)

### 3. Configure environment

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env.local
```

Defaults match the Docker Postgres above — only change `JWT_SECRET` to a long random string.

### 4. Load schema

```bash
npm run db:init
```

## Develop

```bash
npm run dev
```

API on http://localhost:4000, web client on http://localhost:3000.

## API

Base URL: `/api`

| Method | Path                | Auth   | Description                |
| ------ | ------------------- | ------ | -------------------------- |
| POST   | `/users/register`   | —      | Register, returns JWT      |
| POST   | `/users/login`      | —      | Login, returns JWT         |
| GET    | `/users/me`         | Bearer | Current user               |
| GET    | `/users`            | Admin  | List users                 |
| GET    | `/products`         | —      | List products              |
| GET    | `/products/:id`     | —      | Get product                |
| POST   | `/products`         | Admin  | Create product             |
| PUT    | `/products/:id`     | Admin  | Update product             |
| DELETE | `/products/:id`     | Admin  | Delete product             |
| GET    | `/orders`           | Bearer | List own orders            |
| GET    | `/orders/:id`       | Bearer | Get own order with items   |
| POST   | `/orders`           | Bearer | Create order from items    |

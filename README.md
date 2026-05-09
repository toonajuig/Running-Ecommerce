# Ecommerce Mini Project

Monorepo for a small ecommerce app.

- `client/` — Next.js 15 (App Router), Tailwind CSS, TanStack Query v5
- `server/` — Express.js + PostgreSQL (raw SQL via `pg`), JWT auth
- `sql/init.sql` — schema for `users`, `products`, `orders`, `order_items`

## Prerequisites

- Node.js 20+
- PostgreSQL 14+

## Setup

```bash
npm install
cp server/.env.example server/.env
cp client/.env.example client/.env.local
```

Edit `server/.env` to point at your PostgreSQL instance, create the database, then load the schema:

```bash
createdb ecommerce
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

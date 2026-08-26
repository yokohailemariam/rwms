# RWMS

RONA Workforce Management System is a NestJS backend for multi-tenant factory workforce operations. It covers tenant setup, user authentication, worker identity, attendance, scheduling, leave, payroll, kiosk sync, emergency incidents, notifications, analytics, compliance/audit logs, and realtime updates.

## Stack

- NestJS 11, TypeScript, CQRS
- Prisma 7 with PostgreSQL
- Redis and BullMQ for queues
- Kafka with an outbox table for event publishing
- Socket.IO for realtime updates
- MinIO for object storage
- Prometheus and Grafana for metrics/monitoring
- Docker Compose for local infrastructure

## Requirements

- Node.js 22+
- pnpm 11+
- Docker and Docker Compose

The package manager is pinned in `package.json`.

## Environment

Create a local environment file from the example:

```bash
cp .env.example .env
```

The Docker Compose defaults are ready for local development. For non-Docker local runs, make sure `DATABASE_URL`, Redis, Kafka, MinIO, SMTP, and JWT values match your running services.

## Quick Start With Docker

Start the full development stack with hot reload:

```bash
make dev
```

Or run it detached:

```bash
make dev-d
```

Run migrations and seed the demo data:

```bash
make db-migrate-dev
make db-seed
```

The seed creates:

- Tenant: `Demo Manufacturing Co.`
- Factory: `Main Factory`
- Admin login: `admin@demo.com`
- Admin password: `Admin@1234`

## Local App URLs

- API: `http://localhost:3000`
- Swagger docs: `http://localhost:3000/api/docs`
- Liveness: `http://localhost:3000/health/live`
- Readiness: `http://localhost:3000/health/ready`
- Grafana: `http://localhost:3001` (`admin` / `admin`)
- Prometheus: `http://localhost:9090`
- MinIO console: `http://localhost:9001`
- MailHog: `http://localhost:8025`
- pgAdmin: `http://localhost:8080`

## Running Without Docker

Install dependencies:

```bash
pnpm install
```

Generate the Prisma client:

```bash
pnpm prisma:generate
```

Run migrations:

```bash
pnpm prisma:migrate:dev
```

Seed the database:

```bash
pnpm prisma:seed
```

Start the API:

```bash
pnpm start:dev
```

This assumes Postgres, Redis, Kafka, MinIO, and SMTP-compatible mail service are already running and reachable using `.env`.

## Common Commands

```bash
pnpm build              # Build the NestJS application
pnpm start:dev          # Start with hot reload
pnpm start:prod         # Run compiled dist/main
pnpm typecheck          # Type-check without emitting files
pnpm test               # Run unit tests
pnpm test:e2e           # Run e2e tests
pnpm lint               # Lint and auto-fix
pnpm format             # Format source and tests
pnpm prisma:generate    # Generate Prisma client
pnpm prisma:migrate:dev # Create/apply local migrations
pnpm prisma:migrate     # Apply production migrations
pnpm prisma:seed        # Seed demo data
```

Makefile wrappers are also available:

```bash
make dev                # Start development stack
make dev-d              # Start development stack detached
make dev-down           # Stop development stack
make dev-logs-api       # Tail API logs
make db-migrate-dev     # Run/create dev migrations in container
make db-seed            # Seed database in container
make test               # Run tests in dev container
make typecheck          # Run TypeScript typecheck in dev container
make infra-up           # Start only infrastructure services
```

## API Areas

Most business endpoints are under `/api/v1`.

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/refresh`
- `GET /api/v1/auth/me`
- `POST /api/v1/tenants`
- `GET /api/v1/tenants/:id`
- `POST /api/v1/workers`
- `GET /api/v1/workers`
- `GET /api/v1/workers/:id`
- `PATCH /api/v1/workers/:id`
- `PATCH /api/v1/workers/:id/status`
- `POST /api/v1/attendance/clock-in`
- `POST /api/v1/attendance/clock-out`
- `PATCH /api/v1/attendance/:id/correct`
- `GET /api/v1/attendance/worker/:workerId`
- `GET /api/v1/attendance/daily`
- `POST /api/v1/scheduling/shifts`
- `POST /api/v1/scheduling/assignments`
- `GET /api/v1/scheduling/roster`
- `POST /api/v1/leave/requests`
- `GET /api/v1/leave/requests`
- `PATCH /api/v1/leave/requests/:id/approve`
- `PATCH /api/v1/leave/requests/:id/reject`
- `GET /api/v1/leave/balance/:workerId`
- `POST /api/v1/payroll/periods`
- `POST /api/v1/payroll/periods/:id/generate`
- `GET /api/v1/payroll/payslips`
- `GET /api/v1/payroll/payslips/:id`
- `POST /api/v1/kiosk/devices`
- `PATCH /api/v1/kiosk/devices/:id/approve`
- `GET /api/v1/kiosk/config`
- `POST /api/v1/kiosk/sync`
- `POST /api/v1/emergency/incidents`
- `PATCH /api/v1/emergency/incidents/:id/resolve`
- `GET /api/v1/emergency/incidents`
- `GET /api/v1/analytics/kpis`
- `GET /api/v1/analytics/attendance-trends`
- `GET /api/v1/compliance/audit-logs`
- `POST /api/v1/compliance/workers/:id/anonymize`

Swagger at `/api/docs` is the best source for request and response shapes.

## Realtime

Socket.IO is exposed on the `/realtime` namespace. Clients must pass a JWT through `handshake.auth.token` or an `Authorization: Bearer <token>` header.

Supported client subscription:

- `subscribe:factory` with a factory ID

Server-side broadcasts include:

- `attendance:update`
- `emergency:alert`
- `notification:new`

## Database

Prisma schema files live in `prisma/models` and enums live in `prisma/enums`. The Prisma client is generated into `src/infrastructure/database/generated/prisma`.

Migrations live in `prisma/migrations`.

## Project Layout

```text
src/
  common/          Shared guards, decorators, filters, interceptors, DTOs, utils
  config/          Runtime configuration loaders
  events/          Domain event definitions
  infrastructure/  Prisma, Redis, Kafka, outbox, storage, health, metrics
  modules/         Business modules
prisma/
  models/          Prisma model files
  enums/           Prisma enum files
  migrations/      Database migrations
  seed.ts          Demo data seed
```

## Production Notes

The production Docker image builds the NestJS app, generates the Prisma client, installs production dependencies only, and runs as a non-root user.

Before production deployment:

- Replace all default secrets and passwords.
- Restrict CORS origins.
- Use managed or hardened Postgres, Redis, Kafka, and object storage.
- Run `pnpm typecheck`, `pnpm test`, and `pnpm build`.
- Apply migrations with `pnpm prisma:migrate`.
- Review tenant isolation, role permissions, public routes, and audit requirements.

## CQRS Pattern

                    Application
                        │
             ┌──────────┴──────────┐
             │                     │
          COMMAND                QUERY
             │                     │
        Change state             Read state
             │                     │
       CommandHandler           QueryHandler
             │                     │
          Repository             Repository
             │                     │
             └─────────┬───────────┘
                       │
                    Database

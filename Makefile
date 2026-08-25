# ─── RWMS Makefile ────────────────────────────────────────────────────────────
# Usage: make <target>
# Requires: docker, docker compose

COMPOSE      := docker compose
COMPOSE_DEV  := docker compose -f docker-compose.yml -f docker-compose.dev.yml
APP          := api

.DEFAULT_GOAL := help

# ─── Help ─────────────────────────────────────────────────────────────────────

.PHONY: help
help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-28s\033[0m %s\n", $$1, $$2}' \
		| sort

# ─── Development ──────────────────────────────────────────────────────────────

.PHONY: dev
dev: ## Start all services in development mode (hot-reload)
	$(COMPOSE_DEV) up --build

.PHONY: dev-d
dev-d: ## Start all services in development mode (detached)
	$(COMPOSE_DEV) up --build -d

.PHONY: dev-down
dev-down: ## Stop development environment
	$(COMPOSE_DEV) down

.PHONY: dev-restart
dev-restart: ## Restart the API service only (dev)
	$(COMPOSE_DEV) restart $(APP)

.PHONY: dev-logs
dev-logs: ## Tail logs for all dev services
	$(COMPOSE_DEV) logs -f

.PHONY: dev-logs-api
dev-logs-api: ## Tail API logs only (dev)
	$(COMPOSE_DEV) logs -f $(APP)

.PHONY: dev-shell
dev-shell: ## Open a shell inside the running dev API container
	$(COMPOSE_DEV) exec $(APP) sh

.PHONY: dev-ps
dev-ps: ## Show status of dev containers
	$(COMPOSE_DEV) ps

# ─── Production ───────────────────────────────────────────────────────────────

.PHONY: build
build: ## Build the production Docker image
	$(COMPOSE) build --no-cache $(APP)

.PHONY: up
up: ## Start all production services (detached)
	$(COMPOSE) up -d

.PHONY: up-build
up-build: ## Build and start all production services
	$(COMPOSE) up --build -d

.PHONY: down
down: ## Stop production environment (keep volumes)
	$(COMPOSE) down

.PHONY: down-v
down-v: ## Stop production environment and remove volumes
	$(COMPOSE) down -v

.PHONY: restart
restart: ## Restart the API service only (prod)
	$(COMPOSE) restart $(APP)

.PHONY: logs
logs: ## Tail logs for all production services
	$(COMPOSE) logs -f

.PHONY: logs-api
logs-api: ## Tail API logs only (prod)
	$(COMPOSE) logs -f $(APP)

.PHONY: shell
shell: ## Open a shell inside the running prod API container
	$(COMPOSE) exec $(APP) sh

.PHONY: ps
ps: ## Show status of production containers
	$(COMPOSE) ps

# ─── Database ─────────────────────────────────────────────────────────────────

.PHONY: db-migrate
db-migrate: ## Run pending Prisma migrations (prod)
	$(COMPOSE) exec $(APP) pnpm prisma migrate deploy

.PHONY: db-migrate-dev
db-migrate-dev: ## Run/create Prisma migrations (dev)
	$(COMPOSE_DEV) exec $(APP) pnpm prisma migrate dev

.PHONY: db-generate
db-generate: ## Regenerate Prisma client
	$(COMPOSE_DEV) exec $(APP) pnpm prisma generate

.PHONY: db-seed
db-seed: ## Seed the database
	$(COMPOSE_DEV) exec $(APP) pnpm prisma:seed

.PHONY: db-reset
db-reset: ## Reset the database (drops all data!)
	$(COMPOSE_DEV) exec $(APP) pnpm prisma migrate reset --force

.PHONY: db-studio
db-studio: ## Open Prisma Studio (runs on host, connects to dev DB)
	DATABASE_URL=postgresql://rwms:rwms_pass@localhost:5432/rwms_db pnpm prisma studio

.PHONY: db-shell
db-shell: ## Open a psql shell inside the Postgres container
	$(COMPOSE) exec postgres psql -U rwms -d rwms_db

# ─── Tests ────────────────────────────────────────────────────────────────────

.PHONY: test
test: ## Run unit tests inside the dev container
	$(COMPOSE_DEV) exec $(APP) pnpm test

.PHONY: test-watch
test-watch: ## Run unit tests in watch mode
	$(COMPOSE_DEV) exec $(APP) pnpm test:watch

.PHONY: test-cov
test-cov: ## Run unit tests with coverage report
	$(COMPOSE_DEV) exec $(APP) pnpm test:cov

.PHONY: test-e2e
test-e2e: ## Run end-to-end tests
	$(COMPOSE_DEV) exec $(APP) pnpm test:e2e

# ─── Code Quality ─────────────────────────────────────────────────────────────

.PHONY: lint
lint: ## Lint and auto-fix source files
	$(COMPOSE_DEV) exec $(APP) pnpm lint

.PHONY: format
format: ## Format source files with Prettier
	$(COMPOSE_DEV) exec $(APP) pnpm format

.PHONY: typecheck
typecheck: ## Run TypeScript type-checking (no emit)
	$(COMPOSE_DEV) exec $(APP) pnpm typecheck

# ─── Infrastructure ───────────────────────────────────────────────────────────

.PHONY: infra-up
infra-up: ## Start only infrastructure services (no API)
	$(COMPOSE) up -d postgres redis kafka minio minio-init elasticsearch mailhog prometheus grafana

.PHONY: infra-down
infra-down: ## Stop only infrastructure services
	$(COMPOSE) stop postgres redis kafka minio elasticsearch mailhog prometheus grafana

# ─── Monitoring ───────────────────────────────────────────────────────────────

.PHONY: open-grafana
open-grafana: ## Open Grafana in the browser (admin/admin)
	open http://localhost:3001

.PHONY: open-prometheus
open-prometheus: ## Open Prometheus in the browser
	open http://localhost:9090

.PHONY: open-mailhog
open-mailhog: ## Open MailHog in the browser
	open http://localhost:8025

.PHONY: open-minio
open-minio: ## Open MinIO console in the browser
	open http://localhost:9001

# ─── Cleanup ──────────────────────────────────────────────────────────────────

.PHONY: clean
clean: ## Remove stopped containers and dangling images
	docker container prune -f
	docker image prune -f

.PHONY: clean-all
clean-all: ## Remove ALL unused Docker resources (volumes, networks, images)
	docker system prune -af --volumes

.PHONY: clean-build
clean-build: ## Remove the built API image to force a full rebuild
	docker rmi rwms-api 2>/dev/null || true

<div align="center">
  <img src="hero.png" alt="AgentEase hero" />
</div>

## Why AgentEase

AgentEase is a production-ready open-source monorepo for building, testing, and deploying Salesforce AI agents through a guided no-code / low-code experience.
It is designed for non-technical users first: consultants, admins, CX teams, and operations teams who need Agentforce DX power without CLI complexity.
Salesforce Agentforce DX is powerful, but CLI-driven workflows are hard to operationalize across mixed-skill teams.
AgentEase adds:

- A **wizard-based builder** for agent creation.
- A **chat playground** for safe simulation.
- A **deployment workflow with logs**.
- **OAuth-based multi-org connectivity**.
- A strict backend architecture that supports long-term scale.

## Architecture Overview

This repository uses **Turborepo** and strict layered backend design.

### Monorepo Layout

```txt
apps/
  web/        Next.js App Router app (no-code UX)
  desktop/    Electron wrapper for local CLI + filesystem use
  api/        Express + Prisma backend

packages/
  ui/          Shared UI primitives
  types/       Shared strict TypeScript contracts
  agent-engine/ Agent config validation/build logic
  salesforce/  OAuth and token vault abstractions
  cli-wrapper/ Agentforce DX CLI integration via spawn
```

### Backend Layering (apps/api)

Each module follows:

- `controller.ts` → HTTP transport only
- `service.ts` → business logic
- `repository.ts` → persistence layer
- `types.ts` → module contracts

Modules included:

- `agent`
- `auth`
- `deployment`
- `org`

### Key API Endpoints

- `POST /api/agents`
- `GET /api/agents`
- `POST /api/deploy`

## Core Product Flows

### 1) Create Agent (No-code wizard)
Users progress through simple steps:
1. Name
2. Description
3. Prompt template

### 2) Test in Playground
Users can simulate interactions in chat format before deployment.

### 3) Deploy to Salesforce
Deployment calls the CLI wrapper, streams logs, and stores deployment records.

## CLI Wrapper (packages/cli-wrapper)

`AgentforceService` exposes:

- `createAgent(config)`
- `previewAgent(config)`
- `deployAgent(config, org)`

Implementation highlights:

- Uses `child_process.spawn` (not `exec`)
- Captures stdout/stderr streams
- Parses JSON log lines into structured metadata
- Returns a strict result shape:

```ts
{
  success: boolean;
  logs: string[];
  errors: string[];
  metadata?: Record<string, unknown>;
}
```

## Database

Prisma + embedded SQLite models:

- `User`
- `Agent`
- `SalesforceOrg`
- `Deployment`

Schema: `apps/api/prisma/schema.prisma`

## Environment Setup

Copy and configure:

```bash
cp .env.example .env
```

Important keys include:
- `DATABASE_URL`
- `JWT_SECRET`
- `SALESFORCE_CLIENT_ID`
- `SALESFORCE_CLIENT_SECRET`
- `SALESFORCE_REDIRECT_URI`
- `SALESFORCE_LOGIN_URL`
- `AGENTFORCE_CLI_BIN`

## Local Development

```bash
npm install
npm run dev
```

Run only API tests:

```bash
npm --workspace @agentease/api test
```

## Non-Technical UX Design Principles

AgentEase intentionally optimizes for low cognitive load:

- Progressive disclosure in the agent wizard.
- Human-readable deployment logs.
- Clear navigation with task-oriented routes (`/dashboard`, `/agents`, `/playground`).
- Safe simulation before production deploy.

## Security Notes

- OAuth token storage uses an **encrypted placeholder vault** abstraction by default.
- Replace placeholder vault implementation with KMS/HSM-backed encryption in production.
- Keep all secrets in environment variables.

## License

MIT © 2026 AgentEase

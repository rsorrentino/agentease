# 🚀 AgentEase

**Build Salesforce AI agents without code.**

AgentEase is an open-source platform that simplifies the creation, testing, and deployment of Salesforce AI agents powered by Agentforce DX.

Designed for consultants, business teams, and non-technical users, AgentEase removes the need to work directly with CLI tools and complex configurations.

---

## ✨ Why AgentEase?

Building agents with Agentforce DX is powerful—but not accessible to everyone.

AgentEase bridges that gap by providing:
- A guided, no-code interface
- Visual configuration of agents
- Built-in testing environment
- One-click deployment to Salesforce

---

## 🧩 Features

- **No-Code Agent Builder**  
  Create agents using a step-by-step wizard

- **Prompt & Tool Configuration**  
  Define behavior without writing code

- **Interactive Playground**  
  Test your agent in a chat interface

- **Agentforce DX Integration**  
  Automatically generates and executes CLI workflows

- **One-Click Deployment**  
  Deploy agents to connected Salesforce orgs

- **Multi-Org Support**  
  Manage multiple environments easily

---

## 🏗️ Architecture

AgentEase is built as a monorepo:

apps/
  web/        → Next.js frontend
  desktop/    → Electron app
  api/        → Backend API

packages/
  ui/         → Shared UI components
  agent-engine/
  salesforce/
  cli-wrapper/

Key principles:
- Modular architecture
- Strict separation of concerns
- Typed end-to-end (TypeScript)

---

## ⚙️ Tech Stack

- Frontend: Next.js, React, TailwindCSS, shadcn/ui
- Backend: Node.js, Express
- Database: PostgreSQL + Prisma
- Desktop: Electron
- Integration: Agentforce DX

---

## 🚀 Getting Started

### 1. Clone the repo
git clone https://github.com/your-org/agentease.git  
cd agentease

### 2. Install dependencies
npm install

### 3. Configure environment
cp .env.example .env

### 4. Run development
npm run dev

---

## 🧪 Usage

### Create an Agent
- Open the dashboard
- Start the Agent Builder
- Define prompts, tools, and data sources

### Test
- Use the playground to simulate interactions

### Deploy
- Connect a Salesforce org
- Deploy with one click

---

## 🛣️ Roadmap

- Visual drag-and-drop agent builder
- Agent versioning
- Collaboration (teams & roles)
- Real-time execution logs
- Marketplace for templates

---

## 🤝 Contributing

Contributions are welcome.

Steps:
1. Fork the repository
2. Create a feature branch
3. Submit a pull request

Guidelines:
- Use TypeScript
- Follow modular architecture
- Keep functions small and testable

---

## 📜 License

MIT License

Copyright (c) 2026 AgentEase

---

## 💡 Vision

AgentEase aims to become the standard interface for building and managing Salesforce AI agents—bringing the power of Agentforce DX to everyone, not just developers.

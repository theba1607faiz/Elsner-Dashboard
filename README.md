# ELSNER CRM Dashboard

A full-stack CRM dashboard that syncs real-time customer data from a remote MongoDB instance into PostgreSQL, and presents it through an interactive React dashboard with live updates.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Recharts |
| Backend API | Node.js, Express, PostgreSQL |
| Data Sync | MongoDB → PostgreSQL live sync engine |
| Real-time | Server-Sent Events (SSE) |

## Project Structure

```
DASHBOARD ELSNER/
├── api/              # Express REST API + SSE server (port 3002)
│   ├── routes/       # 12 API endpoints (deals, companies, contacts, etc.)
│   ├── db.js         # PostgreSQL connection pool
│   └── sse.js        # SSE broadcaster (pushes updates every 30s)
├── dashboard/        # React frontend (Vite)
│   └── src/
│       ├── pages/    # Overview, Deals, Companies, Contacts, Tasks, Invoices, Outreaches
│       ├── components/ # KPICard, DataTable, PipelineChart, RevenueChart, LiveFeed
│       └── hooks/    # useApi, useSSE
├── scripts/          # Utility and test scripts
├── logs/             # Rotating runtime logs (auto-generated)
├── start-all.ps1     # Launches all services in separate windows
└── queries.txt       # Sample BI queries for reference
```

> `automation/` and `env/` are excluded from version control via `.gitignore`.

## Data Flow

```
MongoDB (remote) → Sync Engine → PostgreSQL → Express API → React Dashboard
                                                       ↑
                                              SSE live updates (30s)
```

1. **Sync Engine** watches MongoDB change streams (falls back to polling every 5s)
2. **Mapper** transforms MongoDB documents to PostgreSQL schema
3. **API** serves REST endpoints and an SSE stream
4. **Dashboard** fetches data and auto-refreshes on SSE events

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL (local)
- Access to the remote MongoDB instance

### Install Dependencies

```bash
# API
cd api && npm install

# Dashboard
cd dashboard && npm install
```

### Environment Setup

Create your environment files inside the `env/` folder (excluded from git):

- `env/api.env` — PostgreSQL connection string, port, etc.
- `env/automation.env` — MongoDB URI, sync interval, etc.

### Run All Services

```powershell
# From project root — opens each service in a separate terminal window
.\start-all.ps1
```

Or start individually:

```bash
# API server (port 3002)
cd api && node index.js

# React dashboard (Vite dev server)
cd dashboard && npm run dev
```

## Features

- **Real-time Sync** — MongoDB change streams with polling fallback
- **Live UI Updates** — SSE keeps the dashboard fresh every 30 seconds
- **Full CRM Data Model** — Deals, Companies, Contacts, Tasks, Invoices, Outreaches
- **Analytics** — Pipeline charts, revenue trends, KPI cards
- **Error Resilience** — Graceful DB outage handling, log rotation at 50 MB

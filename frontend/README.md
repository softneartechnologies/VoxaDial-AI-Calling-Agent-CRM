# VoxaDial — AI Calling Agent + CRM (Frontend)

React 19 + TypeScript + Vite + Tailwind. Runs fully on demo data today; the backend plugs in through one file.

## Run
```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # production build -> dist/
```

## Screens
| Route | What it is |
|---|---|
| `#/` | Marketing site: hero, how it works, features, why us, pricing, FAQ, demo form |
| `#/login` | Login / sign-up |
| `#/app` | Dashboard: KPIs, hourly volume, outcomes, campaigns, recent calls |
| `#/app/live` | Live monitor: listen / whisper / take over |
| `#/app/agents`, `#/app/agents/:id` | AI agent list + builder (prompt, voice, transfer, knowledge, test chat) |
| `#/app/campaigns` | Campaigns + 4-step wizard (mode, CSV leads, schedule, review) |
| `#/app/contacts` | CRM table, filters, CSV import/export, contact drawer (activity, calls, notes) |
| `#/app/pipeline` | Drag-and-drop kanban by lead stage |
| `#/app/calls` | Call logs with recording player, AI summary, transcript |
| `#/app/analytics` | Funnel, trends, agent & campaign leaderboards |
| `#/app/numbers` `#/app/integrations` `#/app/settings` | DIDs, integrations, team/compliance/API/billing |

A floating **Web Phone** (dial pad, mute/hold/transfer, live transcript) is available on every app screen.

## Project structure
```
src/
  api/types.ts      <- domain models = the backend contract
  api/client.ts     <- ALL data access; mock vs real switch
  api/mockData.ts   <- demo data (delete when backend is live)
  components/ui.tsx <- shared UI (Badge, Modal, Drawer, StatCard…)
  layouts/AppLayout.tsx  <- sidebar, topbar, softphone
  pages/site/*      <- public site
  pages/app/*       <- dashboard screens
  config/brand.ts   <- product name & contact info
```

## Connecting the backend (next phase)
Set `VITE_USE_MOCK=false` and `VITE_API_URL`. The client expects these endpoints (JSON, Bearer token):

```
POST /auth/login
GET  /dashboard/stats          GET /calls/live
GET  /contacts  POST /contacts  GET|PATCH /contacts/:id  POST /contacts/import
GET|POST /contacts/:id/activities
GET  /agents  POST /agents  GET|PUT /agents/:id
GET  /campaigns  POST /campaigns  POST /campaigns/:id/status
GET  /calls[?contactId=]  POST /calls/dial
GET  /numbers  GET /integrations  POST /integrations/:id/toggle
```
Suggested backend: Node (NestJS/Express) + PostgreSQL (Prisma) + Redis/BullMQ for the dialer queue,
Twilio/Telnyx for telephony (Media Streams over WebSocket), a streaming STT (e.g. Deepgram),
an LLM for the agent brain, and a TTS voice (e.g. ElevenLabs), plus WebSockets for live monitor.

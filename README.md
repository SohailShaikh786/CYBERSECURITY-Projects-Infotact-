# Threat Intelligence Feed Processor

This repository hosts the **Supabase-powered React dashboard** together with the **Flask-assisted IP intelligence helper** (`app.py`). The UI correlates threat feeds, logs, and alerts, while `app.py` directly queries AbuseIPDB and AlienVault OTX for spot checks.

## Architecture & Stack

- **Frontend**: Vite + React 18 + TypeScript with shadcn/ui and Tailwind CSS (`src/App.tsx`, `src/routes.tsx`).
- **Data**: Supabase (PostgreSQL + Realtime + Authible) via `src/db/supabase.ts` and the RPCs described in `src/db/api.ts`.
- **Backend helper**: Flask + Requests (`app.py`) exposes a simple web form for checking individual IP addresses.

## Repository Snapshot

```
├── app.py                 # Flask entry point for AbuseIPDB & OTX checks
├── package.json           # Node scripts (lint-only) and dependency list
├── src/
│   ├── App.tsx            # React router shell
│   ├── db/supabase.ts     # Supabase client initializer
│   ├── db/api.ts          # Supabase queries and RPC wrappers
│   └── pages/             # Feature pages (Dashboard, IOCs, Alerts, etc.)
├── public/                # Static assets for the Vite app
├── README.md              # This document
└── tsconfig*.json         # TypeScript configurations
```

## Prerequisites

| Tool | Minimum Version |
| --- | --- |
| Node.js | 20.0.0 |
| npm | 10.0.0 |
| Python | 3.11 |

Ensure `node -v`, `npm -v`, and `python -V` report the required versions before proceeding.

## Environment Configuration

1. **Frontend (Supabase)**
   - Create a `.env` (or use the existing `.env`) with your Supabase credentials:

     ```env
     VITE_SUPABASE_URL=https://<your-project>.supabase.co
     VITE_SUPABASE_ANON_KEY=<your-anon-key>
     ```

   - The React app reads these values from `src/db/supabase.ts` to initialize the client.

2. **Backend helper (`app.py`)**
   - `app.py` currently embeds API keys for AbuseIPDB and AlienVault OTX. Replace the literal strings inside the `home` route if you want to use your own credentials.

## Setup Steps

1. **Install frontend dependencies**
   ```cmd
   npm install
   ```

2. **Install backend dependencies**
   ```cmd
   python -m pip install flask requests
   ```

## Running

1. **Start the Flask helper** (exposes `http://localhost:5000/`):

   ```cmd
   python app.py
   ```

2. **Run the React/Supabase UI** (lint script performs static checks + test build; there is no `dev` script):

   ```cmd
   npm run lint or npx vite
   ```

   - If you just want to preview the UI, run `npx vite` after installing dependencies (and while the Flask helper runs in parallel).

## How to Extend

- Add Supabase tables or RPCs inside the `src/db` helpers, then surface them through the `src/pages` components.
- Modify `routes.tsx` to expose new pages. The router already guards unknown paths with a redirect to `/`.
- Hook into the Flask helper for batch IP checks or convert it into a Supabase Edge Function if you need tighter coupling.

## Troubleshooting

- If Supabase queries fail, ensure your `.env` variables match the project, and review `src/db/api.ts` for expected tables.
- Running `npm run lint` may output `CssSyntaxError` or TypeScript errors; fix these before building or deploying.
- The Flask helper returns JSON from AbuseIPDB and OTX; network connectivity is required.

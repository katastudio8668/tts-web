# KATA TTS Web - update

Responsive React + TypeScript customer app for the KATA TTS service.

## AI-assisted development

AI coding agents must read AGENTS.md, docs/engineering/AI_CODING_RULES.md and the Mandatory Anti-Pattern Review before changing or reviewing code. The review checklist is a required pre-merge gate.

## Stack

- Vite + React + TypeScript
- Supabase Auth (Google OAuth)
- React Router
- TanStack Query
- NestJS API hosted separately on Contabo at kata-tts.91-90-82-113.sslip.io

## Local setup

1. Copy .env.example to .env.local.
2. Set the public Supabase project URL and anon/publishable key.
3. Set VITE_API_BASE_URL to the API base URL including /api/v1.
4. Run npm install, then npm run dev.

Never put a Supabase service-role key, VPS credential, private API key, or engine token in Vite variables. Every VITE_* variable is public in the browser bundle.

## Routes

- /signin — Google sign-in
- / — dashboard and account usage
- /generate — text-to-speech workspace
- /history — generation history
- /plans — plans and usage
- /account — profile and sign-out

## Admin Console (planned)

The Admin workspace is specified in [docs/admin-console.md](docs/admin-console.md), with its backend contract in the [KATA TTS API Admin Console specification](https://github.com/thanhtai-personal/korva-tts-api/blob/main/docs/21-admin-console-and-analytics.md). Admin routes and pages are not implemented yet.

All authenticated product data is read from the NestJS API; the API remains authoritative for credits, plans, jobs, payments and audio ownership.

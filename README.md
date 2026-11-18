# Korva TTS Web

Responsive React + TypeScript customer app for the KorvaTTS service.

## Stack

- Vite + React + TypeScript
- Supabase Auth (Google OAuth)
- React Router
- TanStack Query
- NestJS API hosted separately on Contabo

## Local setup

1. Copy `.env.example` to `.env.local`.
2. Set the public Supabase project URL and anon/publishable key.
3. Set `VITE_API_BASE_URL` to the API origin.
4. Run `npm install`, then `npm run dev`.

Never put a Supabase service-role key, VPS credential, private API key, or engine token in Vite variables. Every `VITE_*` variable is public in the browser bundle.

## Routes

- `/signin` — Google sign-in
- `/` — dashboard and account usage
- `/generate` — text-to-speech workspace
- `/history` — generation history
- `/plans` — plans and usage
- `/account` — profile and sign-out

All authenticated product data is read from the NestJS API; the API remains authoritative for credits, plans, jobs, and audio ownership.

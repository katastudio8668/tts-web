# Korva TTS Web Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a responsive Vercel web client for Google sign-in, Vietnamese text-to-speech generation, audio playback, usage, plans, and history.

**Architecture:** Vite + React + TypeScript app uses Supabase Auth for Google OAuth and TanStack Query for server state. All product data and TTS operations flow through the NestJS API on Contabo; the browser never calls the Python engine directly.

**Tech Stack:** Vite, React, TypeScript, React Router, TanStack Query, Supabase JS, Vitest, React Testing Library, Playwright, Vercel.

**Spec:** `docs/superpowers/specs/2026-11-18-korva-tts-web-design.md`

## Global Constraints

- Deploy this frontend to Vercel; keep API and KorvaTTS inference on Contabo.
- Use Supabase Google OAuth; only public Supabase URL/anon-or-publishable key may be exposed to the browser.
- All credits, plans, usage, job status, and ownership are authoritative on the NestJS API.
- Never call the Python engine directly from the browser.
- Do not integrate payment checkout until the owner chooses a provider.
- Keep this project independent of KATA Studio.
- Audio access must use authenticated API endpoints.

## Review Focus

- OAuth cancellation, callback failure, and expired/refreshing sessions must not strand users on a blank screen.
- API 401/403, 429, timeout, offline, and 5xx responses must produce safe actionable UI states.
- Long text and rapid repeated submit clicks must not create duplicate jobs or lose user input.
- Audio playback/download must handle delayed jobs, failed jobs, and expired authorization.
- Empty history, pagination boundaries, and missing optional profile/voice fields must render safely.

---

### Task 1: Bootstrap Vite React TypeScript application

**Files:**
- Create: `package.json`, `index.html`, `vite.config.ts`, `tsconfig.json`, `src/main.tsx`, `src/App.tsx`
- Create: `src/styles/*`, `src/test/setup.ts`, `.env.example`, `.gitignore`

- [ ] Add Vitest and React Testing Library; write a smoke test for the app shell and verify it fails before implementation.
- [ ] Scaffold React + TypeScript + Vite with strict type checking and path aliases.
- [ ] Configure responsive global styles, accessible typography, loading/error primitives, and test setup.
- [ ] Add scripts for dev, build, lint, typecheck, and test.
- [ ] Run `npm run test`, `npm run typecheck`, and `npm run build`; commit as `chore: bootstrap korva tts web`.

### Task 2: Add routing and application layout

**Files:**
- Create: `src/app/router.tsx`, `src/app/providers.tsx`, `src/components/layout/AppShell.tsx`, `src/components/layout/Sidebar.tsx`, `src/components/layout/Topbar.tsx`
- Test: `src/app/router.test.tsx`

- [ ] Test route rendering and responsive navigation behavior.
- [ ] Add React Router routes for sign-in, dashboard, create, history, plans/usage, and account.
- [ ] Add TanStack Query provider and shared layout primitives.
- [ ] Verify keyboard navigation, visible focus, and mobile navigation.
- [ ] Commit as `feat: add app routing and layout`.

### Task 3: Integrate Supabase Google authentication

**Files:**
- Create: `src/lib/supabase.ts`, `src/features/auth/AuthProvider.tsx`, `src/features/auth/SignInPage.tsx`, `src/features/auth/AuthCallbackPage.tsx`, `src/features/auth/ProtectedRoute.tsx`
- Test: `src/features/auth/*.test.tsx`

- [ ] Test logged-out redirect, logged-in route access, OAuth error, cancellation, and session refresh behavior.
- [ ] Configure Supabase client from `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (or the project's public publishable key variable).
- [ ] Implement Google sign-in, OAuth callback handling, session subscription, sign-out, and protected routes.
- [ ] Ensure no service-role key or secret appears in source, build output, or environment examples.
- [ ] Document Supabase authorized redirect URLs and local/Vercel callback origins.
- [ ] Commit as `feat: add supabase google auth`.

### Task 4: Build typed API client and session-aware request layer

**Files:**
- Create: `src/lib/api/client.ts`, `src/lib/api/errors.ts`, `src/lib/api/types.ts`, `src/lib/api/endpoints.ts`
- Test: `src/lib/api/*.test.ts`

**Interfaces:**
- Produces: typed API methods for `me`, plans, usage, voices, generations, history, and audio.
- Consumes: API base URL and current Supabase access token.

- [ ] Test bearer-token injection, missing session, JSON parsing, binary audio response, and normalized HTTP errors.
- [ ] Implement a single fetch wrapper that attaches the current access token and handles 401/403/429/5xx consistently.
- [ ] Define API types against the backend contract; avoid duplicating business calculations in the browser.
- [ ] Add request cancellation and timeout behavior for interactive calls.
- [ ] Commit as `feat: add typed api client`.

### Task 5: Implement dashboard, profile, and usage summary

**Files:**
- Create: `src/features/dashboard/DashboardPage.tsx`, `src/features/dashboard/dashboard.queries.ts`
- Create: `src/features/account/AccountPage.tsx`, `src/features/usage/UsagePage.tsx`
- Test: feature component tests.

- [ ] Test loading, empty, success, and API-error states using mocked API responses.
- [ ] Display account identity, current plan, available credits, usage summary, and recent generations from API responses.
- [ ] Add profile display and sign-out action.
- [ ] Ensure no client-side value can overwrite server-authoritative credits or plan data.
- [ ] Commit as `feat: add dashboard and account views`.

### Task 6: Build text-to-speech workspace and voice catalogue

**Files:**
- Create: `src/features/generate/GeneratePage.tsx`, `src/features/generate/GenerateForm.tsx`, `src/features/voices/voice.queries.ts`
- Create: `src/features/generate/generation.validation.ts`
- Test: generation form and validation tests.

- [ ] Test empty text, text length limit, voice selection, invalid settings, and submit disabled states.
- [ ] Fetch voice catalogue and capabilities from API; do not hardcode availability as authoritative.
- [ ] Build text editor, voice selector, language/speed/steps controls constrained by API capabilities, and live character count.
- [ ] Submit once per deliberate user action; disable duplicate submissions while request is pending.
- [ ] Commit as `feat: add tts generation workspace`.

### Task 7: Add generation progress, audio playback, and download

**Files:**
- Create: `src/features/generate/GenerationStatus.tsx`, `src/features/audio/AudioPlayer.tsx`, `src/features/audio/audio-download.ts`
- Test: job status polling and audio component tests.

**Interfaces:**
- Consumes: generation job ID/status and authenticated audio endpoint from API.

- [ ] Test queued/running/succeeded/failed states and stop polling after terminal status.
- [ ] Implement bounded polling with backoff and query invalidation on completion.
- [ ] Fetch/play WAV through the authorized API; revoke temporary object URLs when no longer needed.
- [ ] Provide retry/recover actions for failed jobs and accessible playback controls.
- [ ] Commit as `feat: add generation status and audio player`.

### Task 8: Implement history and generation detail

**Files:**
- Create: `src/features/history/HistoryPage.tsx`, `src/features/history/HistoryTable.tsx`, `src/features/history/GenerationDetail.tsx`
- Test: history pagination and ownership/error UI tests.

- [ ] Test empty history, pagination boundaries, failed jobs, and detail fetch errors.
- [ ] Fetch paginated history from API and render date, text preview, voice, duration/status, and usage fields returned by the server.
- [ ] Add detail view with audio playback/download for completed jobs.
- [ ] Commit as `feat: add generation history`.

### Task 9: Add plans, packages, and usage presentation

**Files:**
- Create: `src/features/plans/PlansPage.tsx`, `src/features/plans/PlanCard.tsx`
- Test: plans/usage presentation tests.

- [ ] Test plan loading, unavailable plans, and current-plan highlighting.
- [ ] Render plan and entitlement data from the API without inventing prices or checkout URLs.
- [ ] Explain credit balance and usage history in plain Vietnamese.
- [ ] Show a clear “contact/admin activation” or not-yet-available state until a payment provider and purchase flow are approved; do not simulate payment.
- [ ] Commit as `feat: add plans and usage page`.

### Task 10: Polish, accessibility, CI, and Vercel deployment

**Files:**
- Create: `.github/workflows/ci.yml`, `vercel.json` only if required, `docs/deployment-vercel.md`, `docs/supabase-setup.md`

- [ ] Add CI for install, lint, typecheck, unit tests, and production build.
- [ ] Add Playwright smoke coverage for sign-in routing, dashboard loading, generation submission, and history.
- [ ] Verify responsive behavior at mobile, tablet, and desktop widths; verify keyboard-only flows and screen-reader labels.
- [ ] Configure Vercel project to this repository with documented public environment variables; never commit real secrets.
- [ ] Document Supabase Google provider setup and allowed callback URLs.
- [ ] Verify preview and production builds; commit as `chore: add ci and deployment docs`.

# Execution log — Korva TTS Web

**Branch:** `feat/korva-tts-web-mvp`  
**Updated:** 2026-11-19  
**Status:** Frontend MVP code updated; latest changes are not yet deployed or verified by CI.

## Implemented

- Vite + React + TypeScript application, responsive app shell, protected routes, and mobile bottom navigation.
- Supabase Google OAuth session handling, sign-in, callback error display, and sign-out.
- Dashboard with account identity, available credits, monthly usage, current plan, and recent jobs.
- TTS workspace with text editor, voice catalogue, speed setting, generation submission, status polling, audio playback, and WAV download.
- Generation history with authenticated audio playback and download.
- Plans/usage and account screens. No prices or payment checkout have been invented.
- Typed API client with bearer token, timeout, JSON error normalization, authenticated audio fetch, and localized generation status/error messages.
- Fixed the duplicated `/api/v1` URL prefix: `VITE_API_BASE_URL` is configured as the full versioned base URL, and request paths are appended once.
- Added API client unit tests for URL construction, bearer-token injection, NestJS validation-array errors, and insufficient-credit messaging.
- Added an explicit `npm run typecheck` script and included it in GitHub Actions CI.

## Vercel preview

- Project: `korva-tts-web`
- Preview URL: https://korva-tts-web-git-feat-korva-a69a5a-thanhtaipersonals-projects.vercel.app
- A Vercel build previously reached READY for commit `4e5c915a742cc4178af41f9048d887eb8e7485da`.
- That preview predates the latest frontend fixes and is not evidence that the current branch head has been built.
- The preview is protected by the Vercel team's deployment protection.
- A new deployment for the latest branch head was rejected with HTTP 402 `resource_creation_blocked` because the Vercel team exceeded fair-use limits. The team owner must resolve the Vercel billing/plan/security requirement before a new deployment can be created.

## Verification

- GitHub Actions was triggered for the feature branch, but jobs ended before any runner step started. The GitHub Jobs API reported `runner_id=0` and an empty `steps` array.
- Therefore the latest TypeScript build, ESLint, and Vitest results are **not verified**. Tests have been added but must not be described as passing.
- The execution environment could not clone GitHub because outbound DNS/network access was unavailable; local npm verification was not possible.
- The preview has no Supabase or API environment variables, so Google sign-in and live API calls are not active there.

## Remaining before production

1. Restore Vercel team deployment eligibility and deploy the latest feature branch to Preview.
2. Resolve GitHub Actions runner availability, then run lint, typecheck, and unit tests.
3. Configure Vercel public variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY` (public anon/publishable key only)
   - `VITE_API_BASE_URL` (API hostname plus `/api/v1`)
4. Configure Supabase Google provider and exact redirect URLs.
5. Configure API CORS for the exact Vercel origin.
6. Verify sign-in → dashboard → voice list → generation → polling → WAV playback/download → history against the deployed Contabo API.
7. Review and merge the feature branch into `main` only after the checks pass.


## KATA TTS branding and Contabo endpoint (2026-11-19)

- Public product branding is KATA TTS; the underlying Vietnamese synthesis engine remains KorvaTTS.
- Frontend `.env.example` now targets `https://kata-tts.91-90-82-113.sslip.io/api/v1`.
- Backend Compose runtime names and dedicated volumes are renamed to the `kata-tts-*` namespace in the backend feature branch.
- Repository changes do not deploy Vercel or Contabo. Deployment and end-to-end verification remain pending.

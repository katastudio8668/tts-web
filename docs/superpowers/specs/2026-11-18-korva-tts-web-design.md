# Korva TTS Web — Product and Architecture Design

**Date:** 2026-11-18  
**Status:** Planning baseline  
**Repository:** `thanhtai-personal/korva-tts-web`

## Intent

Build the customer-facing web application for the KorvaTTS commercial service. It is an independent React + TypeScript application deployed to Vercel. Users sign in with Google through Supabase Auth, generate Vietnamese speech, listen to/download WAV files, and review usage, credits, plans, and generation history.

## Goals

- Provide a clear responsive dashboard for a Vietnamese-first TTS service.
- Use Supabase Google OAuth for login and session management.
- Call the separate NestJS API on Contabo; the browser never calls the Python engine directly.
- Support voice selection, text input, synthesis settings, job progress, playback/download, history, and usage.
- Keep the UI independent of KATA Studio while allowing shared auth project configuration if the owner chooses.

## Non-goals for the first release

- Hosting or running TTS inference in Vercel.
- Storing business balances or authoritative usage counts in browser state.
- Exposing Supabase service-role keys or API secrets in frontend code.
- Integrating checkout/payment until the owner selects a provider.
- Building an admin console beyond basic account display unless separately approved.

## Architecture

React + TypeScript + Vite app on Vercel. Supabase browser client handles Google sign-in and session refresh using the public anon/publishable key. The app sends the current Supabase access token to the NestJS API over HTTPS. The API remains the source of truth for users, plans, credits, generation jobs, history, and audio access.

## Decisions and implementation calls

- Frontend: Vite + React + TypeScript.
- Data fetching/cache: TanStack Query; typed API client around `fetch`.
- Routing: React Router.
- Auth: Supabase Auth Google provider; protected routes; API bearer token supplied from current session.
- UI: responsive, accessible dashboard with a restrained design system; no dependency on KATA Studio source or deployment.
- Deployment: Vercel connected to this repository.
- Environment: Vite public variables only for Supabase URL, Supabase anon/publishable key, and public API base URL.
- Payment: show plans and entitlement details returned by API; no checkout until provider decision.

## Main screens

1. Sign-in / OAuth callback.
2. Dashboard with remaining credits, usage summary, recent generations, and primary create action.
3. Text-to-speech workspace with text editor, voice selection, language and synthesis settings.
4. Generation status and audio player/download.
5. Generation history with pagination and per-item detail.
6. Plans and usage page.
7. Account/profile and sign-out.

## Constraints and safety

- Do not put Supabase service-role key, private API key, VPS credentials, or engine URL in Vite environment variables.
- Treat API response as authoritative; never calculate or mutate credit balance as a source of truth in the client.
- Do not trust client-side route guards as authorization; API must enforce ownership.
- Handle expired sessions, 401/403, rate limits, network errors, and job failure with clear recovery actions.
- Audio must be fetched from the authorized API endpoint, not from a public filesystem path.
- Do not add KATA Studio branding or modify KATA Studio.

## Success criteria

A user can sign in with Google, see their account/credits, select a voice, submit text, track a generation, play/download the returned WAV, and find it in history. Refreshing the page preserves the auth session and job/history state. Logged-out users cannot access protected screens; API errors are presented without leaking secrets.

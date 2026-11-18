# Execution log — Korva TTS Web

**Branch:** \`feat/korva-tts-web-mvp\`  
**Date:** 2026-11-18  
**Status:** MVP frontend implemented; preview build deployed.

## Implemented in this branch

- Vite + React + TypeScript application, strict TypeScript setup, route structure, dark responsive app shell, and mobile bottom navigation.
- Supabase Google OAuth session handling, protected routes, callback/session redirect, and sign-out.
- Session-aware typed API client with bearer token, timeout, JSON error normalization, and authenticated WAV fetch.
- Dashboard, credit/usage cards, recent jobs, text editor, voice selector, speed control, generation polling, audio playback/download, history, plans, and account screens.
- Empty/loading/error states; plans remain informational until prices and payment flow are approved.
- Vercel project created and a preview deployment built successfully from this feature branch.

## Preview build

- Vercel project: \`korva-tts-web\`
- Preview URL: https://korva-tts-web-git-feat-korva-a69a5a-thanhtaipersonals-projects.vercel.app
- Build result: READY; Vite production build completed successfully for commit `4e5c915a742cc4178af41f9048d887eb8e7485da`. Later small frontend updates and this execution log were committed after that build and have not yet been deployed.
- This is a preview build only. The project is not connected for automatic Git deployments yet.

## Verification evidence and limitations

- Vercel production build passed for the deployed commit.
- GitHub Actions runs were created but failed before any runner step was assigned (runner ID 0 and no steps reported). No GitHub CI test result is claimed.
- The preview has no Supabase or API environment variables yet; Google sign-in and API operations are therefore not live in the preview.
- The preview is protected by the Vercel team's deployment protection settings.
- A subsequent preview deployment request for the latest branch head was blocked by Vercel with HTTP 402 `resource_creation_blocked` (team fair-use limit). No CLI fallback with the local source checkout is available in this session; the team owner must resolve the Vercel limit before another deployment.

## Remaining work before production

- Add \`VITE_SUPABASE_URL\`, \`VITE_SUPABASE_ANON_KEY\` (public anon/publishable key), and \`VITE_API_BASE_URL\` in Vercel after the API hostname is configured.
- Configure Google provider and exact OAuth redirect URLs in Supabase.
- Add the exact Vercel production origin to API CORS.
- Verify the full flow against the deployed Contabo API: sign-in → profile → voice catalogue → generation → polling → WAV playback/download → history/usage.
- Run frontend lint, unit tests, and Playwright flow once GitHub Actions runners are available.
- Connect the repository to Vercel after the implementation branch is reviewed and merged to main.

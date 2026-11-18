# Deploy Korva TTS Web to Vercel

1. Import `thanhtai-personal/korva-tts-web` into Vercel.
2. Select Vite as the framework preset and keep the repository root as the project root.
3. Build command: `npm run build`; output directory: `dist`.
4. Configure the three public environment variables described in `.env.example`.
5. Add the production Vercel domain to Supabase redirect URLs and the API CORS allowlist.
6. Deploy a preview first and verify Google OAuth, dashboard API calls, generation polling, audio playback, and history.
7. Promote to production only after the API hostname and Supabase callback URLs are confirmed.

Do not store server secrets in this Vercel project. The TTS model and API run on Contabo.

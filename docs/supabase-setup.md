# Supabase Google sign-in setup

1. In the Supabase project used for Korva TTS, enable the Google provider under Authentication → Providers.
2. Configure the Google OAuth client ID and client secret in Supabase, not in the Vite application.
3. Add the Supabase callback URL shown in the provider settings to the Google OAuth client's authorized redirect URIs.
4. Add the local and production app origins to Supabase Authentication → URL Configuration:
   - Local: `http://localhost:5173/signin`
   - Production: `https://YOUR_VERCEL_DOMAIN/signin`
   - Add preview origins only if preview deployments should support OAuth.
5. Set the Vercel environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY` (or the public publishable key supplied by the project)
   - `VITE_API_BASE_URL`
6. Add the exact production frontend origin to the API's `CORS_ORIGINS`.

The browser only receives the public anon/publishable key. Never add the Supabase service-role key, JWT signing secret, VPS credentials, or engine token to Vercel frontend variables.

# KATA TTS Web — Copilot instructions

If the Coder/Skill World runtime is available, use its skill-loader and software-development orchestrator; do not assume an external skill is loaded. These repository instructions are the persistent fallback.

Before changing code, read `AGENTS.md` and `docs/engineering/AI_CODING_RULES.md`. Before reviewing or finishing, complete `docs/engineering/ANTI_PATTERN_REVIEW.md` and inspect relevant open items in `bugs/README.md`.

Project: Vite + React 19 + TypeScript, React Router 7, TanStack Query 5 and Supabase Auth. The NestJS API is authoritative for credits, plans, jobs, payment status and audio ownership.

Required workflow: DISCOVER → TRACE → PLAN → IMPLEMENT → REVIEW → VALIDATE → FIX/REVALIDATE. Use test-first for behavioral changes. Review the full diff, all consumers, query keys, session changes, retries and cleanup paths. Critical/High account isolation, authorization, secrets, duplicate generation or incorrect credit presentation findings block merge.

MVP constraint: use existing architecture; do not introduce another global store or state library. TanStack Query owns server state. Avoid speculative abstractions and premature optimization.

Never optimistically debit credit. Reuse an idempotency key for the same generation intent until terminal status; changed payload is a new intent. Polling must stop on terminal status and have bounded/backoff behavior.

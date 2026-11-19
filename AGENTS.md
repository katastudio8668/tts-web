# Instructions for AI Coding Agents

If the Coder/Skill World runtime is available, route software work through `skill-loader` → `software-development-skill` → the smallest relevant lifecycle skills. These repository rules remain mandatory even when that runtime is unavailable.

Read [docs/engineering/AI_CODING_RULES.md](docs/engineering/AI_CODING_RULES.md) before changing code and [docs/engineering/ANTI_PATTERN_REVIEW.md](docs/engineering/ANTI_PATTERN_REVIEW.md) before review/completion.

Mandatory: inspect current source and API contracts, trace UI → query/mutation → API and session/cache boundaries, write regression tests first for behavior changes, inspect the full diff, perform the anti-pattern checklist, run relevant typecheck/lint/tests/build and report only verified results. Critical/High findings involving account isolation, auth, secrets, generation idempotency or incorrect credit display block merge.

This is an MVP: keep changes small, readable and reversible. TanStack Query owns server state. The backend is authoritative for credits, plans, generation jobs, payment state and audio ownership. Never debit or optimistically reduce credit in the browser.
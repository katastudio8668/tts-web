---
applyTo: "src/**/*.{ts,tsx}"
---

Follow the React/TypeScript rules in `docs/engineering/AI_CODING_RULES.md`: keep presentation separate from complex orchestration, use the shared API layer, keep server state in TanStack Query, use strict types, and avoid unnecessary hooks/memoization/global stores. Review account-switch cache isolation, stale requests, idempotency, bounded polling, loading/error/empty states, accessibility and object URL cleanup.
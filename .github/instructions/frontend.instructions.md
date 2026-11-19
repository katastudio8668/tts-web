---
applyTo: "src/**/*.{ts,tsx}"
---

Follow the React/TypeScript and combined Modular + Layered + Atomic architecture rules in `docs/engineering/AI_CODING_RULES.md`. Organize by feature, preserve presentation → application → domain → infrastructure dependency direction, and use Atomic Design only for meaningful UI composition. Pages should compose feature screens; shared code must be genuinely cross-feature. Use the shared API transport, keep server state in TanStack Query, use strict types, and avoid unnecessary hooks/memoization/global stores.

Review account-switch cache isolation, stale requests, idempotency, bounded polling, loading/error/empty states, accessibility, object URL cleanup, cross-feature imports and circular dependencies.

# AI Coding Rules — KATA TTS Web

> Canonical engineering contract for human contributors and AI coding agents. Keep this file aligned with `AGENTS.md`, `.github/copilot-instructions.md`, and the PR template.

## 1. Priority and working principles

Priority order: **correctness and user/data safety → explicit user requirements → current source/API contract → existing architecture/conventions → maintainability → simplicity → measured performance → architectural purity**.

This is an MVP running on constrained infrastructure. Prefer small, readable and recoverable changes. Do not introduce Redux, MobX, state frameworks, generic repositories, UI frameworks, abstraction layers or dependencies without a demonstrated need. TanStack Query already owns server state; do not duplicate it in local/global client state.

Readable and explicit code beats compressed clever code. Avoid unrelated refactors and preserve current UX/API behavior unless the task requires a change.

## 2. Mandatory goal workflow

1. **Discover** — read current source, package scripts, config, relevant tests, API contract and existing bug reports.
2. **Trace** — follow UI/event → component/hook → query/mutation → API client → NestJS response; trace auth, cache and failure/retry paths.
3. **Plan** — define scope, acceptance criteria, affected API/data/state, edge cases and tests.
4. **Implement** — smallest cohesive patch; no unrelated cleanup.
5. **Review** — inspect the complete diff and complete [ANTI_PATTERN_REVIEW.md](ANTI_PATTERN_REVIEW.md).
6. **Validate** — run typecheck, lint, tests, build and safe browser smoke tests appropriate to the change.
7. **Fix and repeat** — resolve regressions caused by the change, then review and validate again.
8. **Report** — state files changed, commands actually run, unverified areas and remaining risks.

Never claim a check passed unless it ran and its output confirms success.

## 3. Test-first and regression policy

For behavioral changes and bug fixes, write a focused regression test first, run it and confirm it fails for the expected reason, then implement the smallest fix and confirm it passes. Continue with the relevant test suite. Assert user-visible behavior and real state changes, not only mock call counts.

Exceptions: pure documentation, generated code, or configuration-only changes with no meaningful executable behavior. If a behavioral test is genuinely impractical, document why and provide the strongest alternative verification. Auth, account switching, cache isolation, generation idempotency, credit display and payment flows require regression coverage.

## 4. React / TypeScript architecture

- Follow the existing Vite + React + TypeScript structure and conventions. Current stack: React 19, React Router 7, TanStack Query 5, Supabase Auth.
- Presentation components primarily render, compose props/events and own small local UI state. Put complex feature orchestration in feature hooks/helpers only when it improves clarity or reuse.
- Keep API requests and response typing in the existing API layer; do not scatter raw `fetch` calls across pages/components.
- TanStack Query owns server state, caching, retries, invalidation and synchronization. Do not mirror server responses into MobX or another store without a concrete reason.
- Centralize query-key conventions where useful. Include the correct identity/tenant dimensions in user-specific keys; clear or isolate sensitive caches on sign-out/account switch.
- Avoid unnecessary `useMemo`, `useCallback`, memo wrappers and trivial hooks. Place state correctly before optimizing.
- Prefer strict TypeScript. Avoid `any`, unsafe casts and non-null assertions when proper narrowing is possible.

### 4.1 Combined architecture: Modular + Layered + Atomic

These are three complementary dimensions, not three competing folder structures:

1. **Modular (feature boundaries):** organize business capabilities by feature/bounded context such as `auth`, `generation`, and `billing`/`payments`. A feature owns its UI, orchestration hooks/use-cases, API adapters and feature-specific types. Other features must not import its private implementation; expose a small public entry point when cross-feature reuse is truly needed.
2. **Layered (dependency direction):** inside a feature, keep dependencies flowing inward: **presentation → application → domain → infrastructure**. Presentation renders and forwards user intent; application hooks/use-cases coordinate workflows; domain contains framework-independent rules/types; infrastructure handles HTTP, storage and external SDKs. Domain code must not import React, router, TanStack Query, Supabase or browser transport.
3. **Atomic (UI composition):** use atoms/molecules/organisms only inside the presentation layer to describe UI responsibility and composition. Atoms are small reusable controls; molecules combine controls into a focused interaction; organisms compose meaningful feature sections. Do not split trivial markup into components or create empty taxonomy folders just to satisfy Atomic Design.

**Preferred target shape (adapt names to the existing codebase; do not mass-migrate just to match this tree):**

```text
src/
  app/                 # router, providers, app bootstrap
  shared/
    api/               # shared HTTP transport and common API primitives
    ui/                # genuinely cross-feature atoms/molecules/organisms
    lib/               # generic utilities with no feature ownership
    types/             # truly shared contracts
  features/
    auth/
      api/ components/ hooks/ model/ types/
    generation/
      api/ components/ hooks/ model/ types/
    billing/
      api/ components/ hooks/ model/ types/
  pages/               # route entry points; compose feature screens
```

Rules for applying the shape:

- Route pages are composition boundaries, not containers for an entire business workflow. Move substantial query/mutation orchestration into feature hooks/use-cases and feature UI into feature components.
- Shared code must be generic and used by more than one feature. A component used by one feature belongs to that feature, even if it is visually reusable.
- Keep HTTP mechanics in shared infrastructure; feature API modules define feature-specific endpoints and map responses to feature contracts. Do not mix transport, UI labels, currency/date formatting and feature workflows into one catch-all file.
- Use feature public exports for intentional cross-feature access. Avoid deep imports into another feature and prevent circular dependencies.
- Keep server state in TanStack Query; keep ephemeral UI state local to the component that owns the interaction. Do not create a second source of truth.
- Apply the architecture incrementally when adding or changing a feature. Do not perform broad folder moves or mass component extraction without a concrete task, tests and a reviewable migration plan.
- Existing files may remain in their current locations until a scoped change touches them; do not treat folder conformity alone as a reason for risky refactoring.

## 5. API, auth and data safety

- The NestJS API is authoritative for credits, plans, jobs, payment status, ownership and audio access. Never calculate or debit credits as a frontend source of truth.
- Treat all browser input and API responses as untrusted; validate form inputs and handle malformed/failed responses.
- Never expose service-role keys, private API keys, engine tokens, VPS credentials or server secrets through `VITE_*` variables. Every Vite env variable is public.
- UI route guards are UX, not authorization. Backend must enforce role, ownership and API-key scopes.
- Keep auth/session lifecycle, cache cleanup and stale-request cancellation safe across account changes.
- Use the shared API client and consistent timeout/error semantics. Do not leak raw provider/internal error details.
- Generation retries for the same payload must reuse the same idempotency key until that job reaches a terminal state. A changed payload is a new intent/key.
- Credit display must reflect authoritative API data. Never optimistically decrement or show a successful charge before the API confirms a persisted successful voice result.
- Polling must stop on terminal states and have bounded/backoff behavior; do not poll indefinitely or after unmount/account change.

## 6. UI states and resource lifecycle

- For async screens, handle loading, error, empty, success and disabled/pending states when applicable.
- Prevent double submission while a mutation is pending; still rely on backend idempotency for network retries.
- Revoke object URLs and clean up subscriptions, timers, listeners and abort controllers.
- Avoid stale closures, state updates after unmount, duplicate requests and effects that loop due to unstable dependencies.
- Keep accessibility basics: semantic buttons/labels, keyboard interaction, focus visibility and meaningful status/error announcements.
- Preserve responsive layout and existing design tokens.

## 7. Maintainability and performance

- ~400 lines per file is a soft review signal, not a hard limit. Split only when responsibility, coupling or testing improves.
- Avoid God Pages, duplicate state, circular imports, giant utility files and hidden side effects.
- Optimize only against evidence: excessive renders, slow interaction, large payload, chatty API, memory leak or measurable hot path.
- Do not add a cache layer or dependency to solve a problem already handled by TanStack Query/browser APIs.

## 8. Mandatory anti-pattern gate

Before requesting review or merging, read [ANTI_PATTERN_REVIEW.md](ANTI_PATTERN_REVIEW.md) and the relevant open items in [bugs/README.md](../../bugs/README.md). Review the complete diff and nearby consumers.

- Every finding must include evidence, file/line, severity, impact and a concrete recommendation.
- Critical/High auth, privacy, account-isolation, duplicate-generation or credit-display findings block merge.
- Deferred findings must be recorded in the bug register with reason and next step.
- New confirmed anti-patterns get an individual `AP-WEB-NNN.md` file and index entry.
- New architecture/coding-rule findings get an individual `CR-WEB-NNN.md` file and index entry.
- When fixed, move the bug report to `fixed-bugs/`, record fix timestamp, commit and evidence, and update both indexes. Use `FIXED` until tests/verification justify `VERIFIED`.

## 9. Validation commands

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

For behavior that depends on browser navigation, OAuth, polling, audio playback/download or account switching, run a browser smoke test when the environment supports it. Report unavailable checks rather than implying they passed.

## 10. Pull request / completion contract

A PR must include goal and acceptance criteria, change summary, tests/results, anti-pattern review findings, known limitations and bug-register links. No merge while Critical/High findings remain unresolved. Keep unrelated changes out.

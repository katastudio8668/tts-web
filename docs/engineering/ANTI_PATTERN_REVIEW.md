# Mandatory Anti-Pattern Review — KATA TTS Web

This review is required for every behavior, auth/session, generation, billing, routing, API-client, caching or state change. For documentation-only changes, mark behavior categories N/A with a reason.

## Review procedure

1. Inspect the complete diff: `git diff --check`, `git diff --stat`, then every changed hunk.
2. Trace changed flows through page/component → hooks/state → TanStack Query → API client → backend contract. Inspect consumers, cache keys and cleanup paths.
3. Read related open reports in [bugs/README.md](../../bugs/README.md). Check for regression against known AP items.
4. Walk every applicable checklist item and mark **PASS**, **FINDING**, or **N/A + reason**.
5. Add regression tests for confirmed behavior defects; update bug register and record intentional deferrals.

## Mandatory checklist

### Correctness and UX
- [ ] Loading, pending, empty, error, success and disabled states are coherent.
- [ ] Form validation matches server constraints; malformed API data is handled.
- [ ] Double-click, slow network, timeout, retry, back navigation and unmount are considered.
- [ ] Polling stops at terminal status, has a bounded strategy/backoff and does not survive an irrelevant session.
- [ ] Audio object URLs, subscriptions, timers, listeners and abort controllers are cleaned up.
- [ ] User-visible errors are actionable and do not expose internals.

### Authentication, privacy and account isolation
- [ ] Protected routes handle loading, expired session and signed-out state.
- [ ] Sign-out/account switch clears or isolates user-specific query cache and local state.
- [ ] Query keys for user-specific data include identity or are invalidated at identity boundaries.
- [ ] In-flight requests from the previous account cannot populate the next account's UI.
- [ ] No secret is embedded in `VITE_*` or browser bundles.
- [ ] Frontend guards are not mistaken for backend authorization.

### Generation and credit
- [ ] Same generation intent reuses its idempotency key through network retries until terminal status.
- [ ] Changed text, voice or settings create a new intent/key.
- [ ] Duplicate submissions are prevented in the UI and deduplicated by backend.
- [ ] UI never debits/optimistically reduces credit; server usage/balance is authoritative.
- [ ] Credit is presented as charged only after persisted voice success is confirmed by API.
- [ ] Failed, timed-out or cancelled generation does not show a successful charge.
- [ ] Job status and audio availability are not inferred from stale cached state.

### React and state architecture
- [ ] TanStack Query remains the source of server state; no unnecessary duplicate global state.
- [ ] Query keys and invalidation are precise and consistent.
- [ ] Effects have correct dependencies and no accidental repeated requests/render loops.
- [ ] No stale closure, race, state update after unmount or response overwrite from older requests.
- [ ] Components are split by real responsibility, not arbitrary line-count or Atomic Design rules.
- [ ] No unnecessary memoization, hooks, global stores or abstractions.

### API client and network behavior
- [ ] API calls use the shared client unless a deliberate reason is documented.
- [ ] Timeout, abort, non-2xx, 204, malformed JSON and network failure are handled.
- [ ] Error mapping is consistent and does not expose raw internal/provider details.
- [ ] Retry policy is bounded and safe for mutation/idempotency semantics.
- [ ] API types match the current backend DTO/response contract.

### Accessibility and performance
- [ ] Controls are semantic and keyboard accessible; labels and status announcements exist where needed.
- [ ] Focus visibility and responsive behavior are preserved.
- [ ] No unbounded polling, excessive refetching, giant payload or obvious render loop is introduced.
- [ ] Performance optimization is evidence-based, not speculative.

### Tests and delivery
- [ ] Regression test covers the original user-visible symptom.
- [ ] Tests assert behavior/state, not only mock calls.
- [ ] Relevant typecheck, lint, tests and build were actually run.
- [ ] Browser smoke test covers critical flow when available.
- [ ] No unrelated formatting, dependency churn, generated output or secrets are included.

## Severity and decision

| Severity | Examples | Gate |
|---|---|---|
| Critical | Cross-account data exposure, secret leakage, auth bypass, destructive action | Block merge/release |
| High | Duplicate generation/charge intent, wrong user's cache, broken auth/session, persistent incorrect state | Block merge |
| Medium | Significant UX state gap, test gap, maintainability issue with bounded impact | Fix or document accepted deferral |
| Low | Cosmetic/style issue without behavior impact | May defer |

For each finding include: **ID, severity, file:line, evidence, trigger, impact, root cause, recommended fix, regression test**.

Do not claim “no anti-patterns” unless the checklist was completed. Use “not reviewed” or “not applicable” honestly.

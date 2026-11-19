## Goal and acceptance criteria

## Changes

## Tests and validation

- [ ] Regression test written first and observed failing for the expected reason (or explain why not applicable).
- [ ] Relevant unit/component tests run.
- [ ] Typecheck, lint and build run.
- [ ] Browser smoke test run for affected auth/navigation/generation/payment/audio flows when available.
- [ ] Unavailable checks and reasons are stated explicitly.

## Mandatory anti-pattern review

- [ ] Read `docs/engineering/ANTI_PATTERN_REVIEW.md` and relevant `bugs/README.md` entries.
- [ ] Reviewed the full diff and traced UI → query/mutation → API contract.
- [ ] Checked sign-out/account switch, cache isolation and in-flight requests.
- [ ] Checked generation idempotency and duplicate-submit/retry behavior.
- [ ] Checked credit display is server-authoritative and never optimistically debited.
- [ ] Checked polling bounds, cleanup, loading/error/empty states and accessibility.
- [ ] Findings recorded with severity, file:line, evidence, impact and fix/deferral.
- [ ] No unresolved Critical/High finding remains, or PR is explicitly blocked.

## Bug register

## Remaining risks / unverified items
